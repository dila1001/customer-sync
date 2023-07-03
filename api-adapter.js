import axios from "axios";
import MockAdapter from "axios-mock-adapter";

export default class ApiAdapter {
  constructor(url, apikey, customers, useMockAdapter = true) {
    this.url = url;
    this.apikey = apikey;
    this.customers = customers;
    this.useMockAdapter = useMockAdapter;
  }

  // GET /api/v1/customer (List customers, result is an array with customer objects)
  async getCustomers(id, name, limit, offset) {
    const params = {
      ...(id && { id }),
      ...(name && { name }),
      ...(limit && { limit }),
      ...(offset && { offset }),
    };
    const url = `${this.url}/api/v1/customer`;

    this.mockGetRequest(url, params);
    const res = await axios.get(url, {
      params,
      headers: { Authorization: `Bearer ${this.apikey}` },
    });
    return res.data;
  }

  // POST /api/v1/customer (Create a customer, result is a customer object)
  async createCustomer(customer) {
    console.log(
      `Creating a customer with id ${customer.id} and name ${customer.name}`
    );

    const url = `${this.url}/api/v1/customer`;
    this.mockPostRequest(url, customer);
    const res = await axios.post(url, customer, {
      headers: { Authorization: `Bearer ${this.apikey}` },
    });

    return res.data;
  }

  // PUT /api/v1/customer/:id (Update a customer, result is a customer object)
  async updateCustomer(customer) {
    console.log(
      `Update customer id ${customer.id}; The new name is ${customer.name}`
    );

    const url = `${this.url}/api/v1/customer/${customer.id}`;
    this.mockPutRequest(url, customer);
    const res = await axios.put(url, customer, {
      headers: { Authorization: `Bearer ${this.apikey}` },
    });
    return res.data;
  }

  // DELETE /api/v1/customer/:id (Delete a customer)
  async deleteCustomer(id) {
    console.log(`Delete customer id ${id}`);

    const url = `${this.url}/api/v1/customer/${id}`;
    this.mockDeleteRequest(url, id);
    await axios.delete(url, {
      headers: { Authorization: `Bearer ${this.apikey}` },
    });
  }

  // Mock methods

  mockGetRequest(url, params) {
    if (!this.useMockAdapter) return;

    let mock = new MockAdapter(axios);

    mock.onGet(url, params).reply((config) => {
      // Check if the request has the correct Authorization header
      if (config.headers.Authorization === `Bearer ${this.apikey}`) {
        return [200, this.customers];
      } else {
        return [401]; // Unauthorized
      }
    });
  }

  mockPostRequest(url, customer) {
    if (!this.useMockAdapter) return;

    let mock = new MockAdapter(axios);

    mock.onPost(url, customer).reply((config) => {
      // Check if the request has the correct Authorization header
      if (config.headers.Authorization === `Bearer ${this.apikey}`) {
        this.customers.push(customer);
        this.customers = this.customers.slice().sort((a, b) => a.id - b.id);
        return [200, customer];
      } else {
        return [401]; // Unauthorized
      }
    });
  }

  mockPutRequest(url, customer) {
    if (!this.useMockAdapter) return;

    let mock = new MockAdapter(axios);

    mock.onPut(url, customer).reply((config) => {
      // Check if the request has the correct Authorization header
      if (config.headers.Authorization === `Bearer ${this.apikey}`) {
        let customerToUpdate = this.customers.find((c) => c.id == customer.id);

        //update properties
        customerToUpdate.name = customer.name;
        return [200, customer];
      } else {
        return [401]; // Unauthorized
      }
    });
  }

  mockDeleteRequest(url, id) {
    if (!this.useMockAdapter) return;

    let mock = new MockAdapter(axios);

    mock.onDelete(url).reply((config) => {
      // Check if the request has the correct Authorization header
      if (config.headers.Authorization === `Bearer ${this.apikey}`) {
        const customerIndexToDelete = this.customers.findIndex(
          (c) => c.id === id
        );
        if (customerIndexToDelete !== -1) {
          this.customers.splice(customerIndexToDelete, 1);
          return [200]; // Successful deletion
        }
        return [400]; // failed to delete
      } else {
        return [401]; // Unauthorized
      }
    });
  }
}
