import React from "react";
import { FlatList, FlatListProps, RefreshControl } from "react-native";

interface RefreshableFlatListProps<T> extends FlatListProps<T> {
  onRefresh: () => Promise<void> | void;
  refreshing?: boolean;
}

function RefreshableFlatList<T>({
  onRefresh,
  refreshing = false,
  ...flatListProps
}: RefreshableFlatListProps<T>) {
  return (
    <FlatList
      {...flatListProps}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#f77b05"
          colors={["#f77b05"]}
          progressBackgroundColor="#ffffff"
        />
      }
    />
  );
}

export default RefreshableFlatList;
