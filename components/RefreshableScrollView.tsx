import React, { ReactNode, useState } from "react";
import { RefreshControl, ScrollView, ScrollViewProps } from "react-native";

interface RefreshableScrollViewProps extends ScrollViewProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  refreshing?: boolean;
}

const RefreshableScrollView = ({
  children,
  onRefresh,
  refreshing: externalRefreshing,
  ...scrollViewProps
}: RefreshableScrollViewProps) => {
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const isRefreshing =
    externalRefreshing !== undefined ? externalRefreshing : internalRefreshing;

  const handleRefresh = async () => {
    if (externalRefreshing === undefined) {
      setInternalRefreshing(true);
    }

    try {
      await onRefresh();
    } finally {
      if (externalRefreshing === undefined) {
        setInternalRefreshing(false);
      }
    }
  };

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#f77b05"
          colors={["#f77b05"]}
          progressBackgroundColor="#ffffff"
        />
      }
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableScrollView;
