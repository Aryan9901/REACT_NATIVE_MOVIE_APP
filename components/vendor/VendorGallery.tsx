import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface VendorGalleryProps {
  vendor: any;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const SPACING = 8;
const PADDING = 16;
const columnWidth =
  (width - PADDING * 2 - SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

export default function VendorGallery({ vendor }: VendorGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [imageDimensions, setImageDimensions] = useState<{
    [key: string]: ImageDimensions;
  }>({});
  const [columns, setColumns] = useState<string[][]>([[], []]);

  const images = vendor?.vendorImages || [];

  // Load image dimensions and organize into columns
  useEffect(() => {
    if (images.length === 0) return;

    const loadImageDimensions = async () => {
      const dimensionsMap: { [key: string]: ImageDimensions } = {};

      await Promise.all(
        images.map((imageUrl: string) => {
          return new Promise<void>((resolve) => {
            Image.getSize(
              imageUrl,
              (width, height) => {
                dimensionsMap[imageUrl] = { width, height };
                resolve();
              },
              () => {
                // Fallback to square if image fails to load
                dimensionsMap[imageUrl] = { width: 1, height: 1 };
                resolve();
              }
            );
          });
        })
      );

      setImageDimensions(dimensionsMap);

      // Organize images into columns (masonry layout)
      const columnHeights = new Array(COLUMN_COUNT).fill(0);
      const newColumns: string[][] = Array.from(
        { length: COLUMN_COUNT },
        () => []
      );

      images.forEach((imageUrl: string) => {
        const dims = dimensionsMap[imageUrl];
        if (!dims) return;

        // Find shortest column
        const shortestColumnIndex = columnHeights.indexOf(
          Math.min(...columnHeights)
        );

        // Add image to shortest column
        newColumns[shortestColumnIndex].push(imageUrl);

        // Update column height
        const aspectRatio = dims.width / dims.height;
        const imageHeight = columnWidth / aspectRatio;
        columnHeights[shortestColumnIndex] += imageHeight + SPACING;
      });

      setColumns(newColumns);
    };

    loadImageDimensions();
  }, [images]);

  if (images.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-4">
        <Ionicons name="images-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-500 mt-4 text-center">
          No images available
        </Text>
      </View>
    );
  }

  const renderImage = (imageUrl: string) => {
    const dims = imageDimensions[imageUrl];
    if (!dims) return null;

    const aspectRatio = dims.width / dims.height;
    const imageHeight = columnWidth / aspectRatio;

    return (
      <TouchableOpacity
        key={imageUrl}
        onPress={() => setSelectedImage(imageUrl)}
        className="rounded-lg overflow-hidden bg-white shadow-sm"
        style={{ width: columnWidth, marginBottom: SPACING }}
      >
        {imageLoading[imageUrl] && (
          <View
            className="absolute inset-0 items-center justify-center bg-gray-100"
            style={{ width: columnWidth, height: imageHeight }}
          >
            <ActivityIndicator size="small" color="#F97316" />
          </View>
        )}
        <Image
          source={{ uri: imageUrl }}
          style={{ width: columnWidth, height: imageHeight }}
          resizeMode="cover"
          onLoadStart={() =>
            setImageLoading((prev) => ({ ...prev, [imageUrl]: true }))
          }
          onLoadEnd={() =>
            setImageLoading((prev) => ({ ...prev, [imageUrl]: false }))
          }
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ padding: PADDING }}
      >
        <View className="flex-row" style={{ gap: SPACING }}>
          {columns.map((column, columnIndex) => (
            <View key={columnIndex} style={{ flex: 1 }}>
              {column.map((imageUrl) => renderImage(imageUrl))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View className="flex-1 bg-black/90">
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            className="absolute top-12 right-4 z-10 bg-white/20 rounded-full p-2"
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center">
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
