export const getCartOwner = (request: any) => {
  if (request.user?.id) {
    return {
      ownerType: "USER",
      ownerId: request.user.id,
    };
  }

  if (!request.headers["x-guest-id"]) {
    throw new Error("Guest ID missing");
  }

  return {
    ownerType: "GUEST",
    ownerId: request.headers["x-guest-id"],
  };
};
