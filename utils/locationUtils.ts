export const formatAddress = (address: any): string => {
  if (!address) return "";

  const parts = [
    address.addressLineOne,
    address.addressLineTwo,
    address.city,
    address.state,
    address.pinCode,
  ];

  // Filter out empty parts and join with a comma
  return parts.filter((part) => part).join(", ");
};
