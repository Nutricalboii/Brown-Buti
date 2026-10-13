import { shopifyFetch } from './shopify';

export interface ShopifyCustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface ShopifyOrderLineItem {
  id: string;
  title: string;
  quantity: number;
  variant?: { image?: { url?: string } | null } | null;
}

export interface ShopifyCustomerOrder {
  id: string;
  orderNumber: number | string;
  processedAt: string;
  fulfillmentStatus?: string | null;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: { edges: Array<{ node: ShopifyOrderLineItem }> };
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  orders?: { edges?: Array<{ node: ShopifyCustomerOrder }> } | null;
}

/**
 * Creates a customer access token (login).
 */
export async function loginCustomer(email: string, password: string) {
  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      email,
      password,
    }
  };

  const response = await shopifyFetch({ query, variables });
  const data = response.body?.data?.customerAccessTokenCreate;

  if (data?.customerUserErrors?.length > 0) {
    throw new Error(String(data.customerUserErrors[0].message || 'Unable to sign in.'));
  }

  return data?.customerAccessToken as ShopifyCustomerAccessToken | undefined;
}

/**
 * Registers a new customer.
 */
export async function registerCustomer(email: string, password: string, firstName?: string, lastName?: string, phone?: string) {
  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  } = {
    email,
    password,
  };

  if (firstName) input.firstName = firstName;
  if (lastName) input.lastName = lastName;
  if (phone) input.phone = phone;

  const variables = { input };

  const response = await shopifyFetch({ query, variables });
  const data = response.body?.data?.customerCreate;

  if (data?.customerUserErrors?.length > 0) {
    throw new Error(String(data.customerUserErrors[0].message || 'Unable to create account.'));
  }

  // After registration, log them in automatically to get the token
  return loginCustomer(email, password);
}

/**
 * Fetches customer details and order history.
 */
export async function getCustomer(accessToken: string): Promise<ShopifyCustomer | null> {
  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        email
        firstName
        lastName
        phone
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 10) {
                edges {
            node {
              id
              title
                    quantity
                    variant {
                      image {
                        url
                      }
                      product {
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = { customerAccessToken: accessToken };

  const response = await shopifyFetch({ query, variables });
  return (response.body?.data?.customer as ShopifyCustomer | null | undefined) || null;
}
