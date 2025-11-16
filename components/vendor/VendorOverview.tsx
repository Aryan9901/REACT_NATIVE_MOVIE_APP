import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

interface VendorOverviewProps {
  vendor: any;
}

const IconMap: any = {
  youtube: { icon: "logo-youtube", color: "#DC2626" },
  facebook: { icon: "logo-facebook", color: "#2563EB" },
  instagram: { icon: "logo-instagram", color: "#DB2777" },
  Twitter: { icon: "logo-twitter", color: "#000000" },
  website: { icon: "globe-outline", color: "#2563EB" },
};

export default function VendorOverview({ vendor }: VendorOverviewProps) {
  const [webViewHeight, setWebViewHeight] = useState(200);

  const getAttributeValue = (name: string) => {
    const attr = vendor?.attributeValues?.find(
      (attr: any) => attr?.name === name
    );
    return attr?.value || "";
  };

  const getSocialMediaLinks = () => {
    const labels = ["facebook", "youtube", "instagram", "Twitter", "website"];
    return (
      vendor?.attributeValues?.filter(
        (attr: any) => labels.includes(attr?.name) && attr?.value
      ) || []
    );
  };

  const formatAddress = () => {
    const addr = vendor?.address;
    if (!addr) return "Address not available";

    const parts = [];
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);

    return parts.length > 0 ? parts.join(", ") : "Address not available";
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenLink = (url: string) => {
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }
    Linking.openURL(url);
  };

  const handleOpenMap = () => {
    const addr = vendor?.address;
    if (!addr) return;

    // Build address string for Google Maps
    const addressParts = [];
    if (addr.address1) addressParts.push(addr.address1);
    if (addr.address2) addressParts.push(addr.address2);
    if (addr.city) addressParts.push(addr.city);
    if (addr.state) addressParts.push(addr.state);
    if (addr.zipCode) addressParts.push(addr.zipCode);

    const addressString = addressParts.join(", ");
    const encodedAddress = encodeURIComponent(addressString);

    // Use coordinates if available, otherwise use address
    let mapUrl;
    if (addr.latitude && addr.longitude) {
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${addr.latitude},${addr.longitude}`;
    } else if (addressString) {
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }

    if (mapUrl) {
      Linking.openURL(mapUrl);
    }
  };

  const aboutUs = getAttributeValue("aboutUs");
  const socialMedia = getSocialMediaLinks();

  return (
    <ScrollView className="flex-1 bg-gray-50 px-2">
      {/* About Us Section */}
      {aboutUs && (
        <View className="bg-white rounded-lg overflow-hidden mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3 px-4 pt-4">
            About Us
          </Text>
          <View className="bg-gray-50">
            <WebView
              originWhitelist={["*"]}
              source={{
                html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <style>
                      * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                      }
                      body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 14px;
                        color: #374151;
                        line-height: 1.6;
                        padding: 12px 16px;
                        background-color: #F9FAFB;
                        overflow-x: hidden;
                      }
                      h1 {
                        font-size: 20px;
                        font-weight: bold;
                        color: #111827;
                        margin-bottom: 12px;
                      }
                      h2 {
                        font-size: 18px;
                        font-weight: bold;
                        color: #111827;
                        margin-bottom: 10px;
                      }
                      h3 {
                        font-size: 16px;
                        font-weight: 600;
                        color: #111827;
                        margin-bottom: 8px;
                      }
                      p {
                        margin-bottom: 12px;
                        line-height: 1.6;
                      }
                      ul, ol {
                        margin-bottom: 12px;
                        padding-left: 24px;
                      }
                      li {
                        margin-bottom: 6px;
                        line-height: 1.6;
                      }
                      strong {
                        font-weight: 600;
                        color: #111827;
                      }
                      em {
                        font-style: italic;
                      }
                      a {
                        color: #F97316;
                        text-decoration: underline;
                      }
                      img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin: 12px 0;
                      }
                    </style>
                    <script>
                      window.onload = function() {
                        const height = document.body.scrollHeight;
                        window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
                      };
                    </script>
                  </head>
                  <body>
                    ${aboutUs}
                  </body>
                </html>
              `,
              }}
              style={{
                height: webViewHeight,
                backgroundColor: "transparent",
              }}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              androidLayerType="software"
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.height) {
                    setWebViewHeight(data.height);
                  }
                } catch (e) {
                  // Ignore parsing errors
                }
              }}
            />
          </View>
        </View>
      )}

      {/* Contact Info Section */}
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Contact Info
        </Text>

        {/* Phone */}
        {vendor.contactNo && (
          <TouchableOpacity
            onPress={() => handleCall(vendor.contactNo)}
            className="flex-row items-center mb-4"
          >
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="call" size={20} color="#2563EB" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-gray-900">
                {vendor.contactNo}
              </Text>
              <Text className="text-xs text-gray-500">Give us a call</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Address */}
        <TouchableOpacity
          onPress={handleOpenMap}
          className="flex-row items-center mb-4"
        >
          <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
            <Ionicons name="location" size={20} color="#DC2626" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-medium text-gray-900">
              {formatAddress()}
            </Text>
            <Text className="text-xs text-gray-500">Our location</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Social Media Links */}
        {socialMedia.map((link: any) => {
          const iconData = IconMap[link.name];
          if (!iconData) return null;

          return (
            <TouchableOpacity
              key={link.name}
              onPress={() => handleOpenLink(link.value)}
              className="flex-row items-center mb-4"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons
                  name={iconData.icon as any}
                  size={20}
                  color={iconData.color}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-gray-900">
                  {link.name}
                </Text>
                <Text className="text-xs text-gray-500" numberOfLines={1}>
                  {link.value}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
