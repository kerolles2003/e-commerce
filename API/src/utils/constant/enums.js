export const discountTybes = {
    FIXED_AMOUNT: "fixedAmount",
    PERCENTAGE: "percentage"
}
Object.freeze(discountTybes)

export const roles = {
    USER: "user",
    ADMIN: "admin",
    SELLER: "seller"
}
Object.freeze(roles)

export const status = {
    PENDING: "pending",
    VERIFIED: "verified",
    BLOCKED: "blocked"
}
Object.freeze(status)

export const paymentMethods = {
    CASH: "cash",
    VISA: 'visa'
}
Object.freeze(paymentMethods)

export const orderStatus = {
    PENDING: "pending",
    IN_PROGRESS: "inProgress",
    DELIVRED: "deleverid",
    CANCELED: "canceled",
    REFUNDED: "refunded"
}