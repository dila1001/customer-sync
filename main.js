import ApiAdapter from "./api-adapter.js";

const api1 = new ApiAdapter("https://api1.example.com", "example-api-key-1", [
  { id: 1, name: "hello" },
  { id: 3, name: "hello2" },
  { id: 10, name: "hello4" },
  { id: 11, name: "hello4" },
  { id: 15, name: "hello" },
]);

const api2 = new ApiAdapter("https://api2.example.com", "example-api-key-2", [
  { id: 1, name: "hello" },
  { id: 2, name: "hello" },
  { id: 10, name: "hello2" },
  { id: 12, name: "hello2" },
  { id: 14, name: "hello2" },
  { id: 15, name: "hello2" },
]);

async function main() {
  const sourceCustomers = await api1.getCustomers();
  const existingCustomers = await api2.getCustomers();

  syncCustomers(sourceCustomers, existingCustomers);

  // Test that assert works
  // Length test
  //await api2.deleteCustomer(sourceCustomers[0].id);

  // name difference
  //await api2.updateCustomer({id: sourceCustomers[0].id, name: sourceCustomers[0].name+'2'});
  assertApiAreInSync();
}

async function assertApiAreInSync() {
  const sourceCustomers = await api1.getCustomers();
  const existingCustomers = await api2.getCustomers();

  if (sourceCustomers.length !== existingCustomers.length) {
    console.log("Count differ between api1 and api2");
    return;
  }

  const mismatch = sourceCustomers.find((customer, index) => {
    const existingCustomer = existingCustomers[index];
    return (
      customer.id !== existingCustomer.id ||
      customer.name !== existingCustomer.name
    );
  });

  if (mismatch) {
    console.log(`Mismatch; expected ${mismatch.id} and ${mismatch.name}`);
    return;
  }

  console.log("Api2 is in sync with Api1");
}

function syncCustomers(source, destination) {
  const deletedCustomerIds = customersToDelete(source, destination);

  const newCustomers = customersToCreate(source, destination);

  const updatedCustomers = customersToUpdate(source, destination);

  deletedCustomerIds.forEach((customerId) => {
    api2.deleteCustomer(customerId);
  });

  newCustomers.forEach((customer) => {
    api2.createCustomer(customer);
  });

  updatedCustomers.forEach((customer) => {
    api2.updateCustomer(customer);
  });
}

function customersToDelete(source, destination) {
  return destination
    .filter((customer) => !source.some((c) => c.id === customer.id))
    .map((customer) => customer.id);
}

function customersToCreate(source, destination) {
  return source.filter(
    (customer) => !destination.some((c) => c.id === customer.id)
  );
}

function customersToUpdate(source, destination) {
  return source.filter((sourceCustomer) => {
    const destinationCustomer = destination.find(
      (c) => c.id === sourceCustomer.id
    );
    return (
      destinationCustomer &&
      (sourceCustomer.name !== destinationCustomer.name ||
        sourceCustomer.email !== destinationCustomer.email)
    );
  });
}

main();
