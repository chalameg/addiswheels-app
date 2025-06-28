import { config } from './config';

export interface UserListingInfo {
  currentListings: number;
  freeListings: number;
  extraListings: number;
  isSubscriber: boolean;
  canAddMore: boolean;
  remainingListings: number;
}

export function calculateListingInfo(
  currentListings: number,
  extraListings: number = 0,
  isSubscriber: boolean = false
): UserListingInfo {
  if (!config.listingLimit.enabled) {
    return {
      currentListings,
      freeListings: config.listingLimit.freeListings,
      extraListings,
      isSubscriber,
      canAddMore: true,
      remainingListings: Infinity
    };
  }

  if (isSubscriber) {
    return {
      currentListings,
      freeListings: config.listingLimit.freeListings,
      extraListings,
      isSubscriber,
      canAddMore: true,
      remainingListings: Infinity
    };
  }

  const totalAllowed = config.listingLimit.freeListings + extraListings;
  const remainingListings = Math.max(0, totalAllowed - currentListings);
  const canAddMore = remainingListings > 0;

  return {
    currentListings,
    freeListings: config.listingLimit.freeListings,
    extraListings,
    isSubscriber,
    canAddMore,
    remainingListings
  };
}

export function getPaymentAmount(listingsNeeded: number): number {
  return listingsNeeded * config.listingLimit.pricePerListing;
} 