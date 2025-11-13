import { useEffect, useRef, useState } from "react";

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
}

export const useGooglePlaces = (apiKey: string, debounceMs: number = 300) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<any>(null);
  const sessionToken = useRef(`session_${Date.now()}`);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            searchTerm
          )}&key=${apiKey}&sessiontoken=${
            sessionToken.current
          }&components=country:in&language=en`
        );

        const data = await response.json();

        if (data.status === "OK" && data.predictions) {
          const formattedResults: PlaceResult[] = data.predictions.map(
            (prediction: any) => ({
              place_id: prediction.place_id,
              description: prediction.description,
              structured_formatting: {
                main_text: prediction.structured_formatting.main_text,
                secondary_text: prediction.structured_formatting.secondary_text,
              },
            })
          );
          setResults(formattedResults);
          setError(null);
        } else {
          console.error(
            "Google Places API error:",
            data.status,
            data.error_message
          );
          setError(data.error_message || data.status);
          setResults([]);
        }
      } catch (err) {
        console.error("Error fetching places:", err);
        setError("Failed to fetch places");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, apiKey, debounceMs]);

  const getPlaceDetails = async (
    placeId: string
  ): Promise<PlaceDetails | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&sessiontoken=${sessionToken.current}&fields=geometry,address_components,formatted_address`
      );

      const data = await response.json();

      if (data.status === "OK" && data.result) {
        // Reset session token after getting details
        sessionToken.current = `session_${Date.now()}`;
        return data.result;
      } else {
        console.error("Place details error:", data.status, data.error_message);
        return null;
      }
    } catch (err) {
      console.error("Error fetching place details:", err);
      return null;
    }
  };

  const clearResults = () => {
    setResults([]);
    setSearchTerm("");
    setError(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    getPlaceDetails,
    clearResults,
  };
};
