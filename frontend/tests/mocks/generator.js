import { faker } from '@faker-js/faker';

// Blueprint for an Event matching your [categorySlug] routes
const createEvent = () => {
  const category = faker.helpers.arrayElement(['music', 'tech', 'sports', 'workshop']);
  return {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    categorySlug: category,
    subCategorySlug: faker.helpers.slugify(faker.commerce.department().toLowerCase()),
    eventDetailsSlug: faker.helpers.slugify(faker.lorem.words(3).toLowerCase()),
    description: faker.lorem.paragraphs(2),
    price: faker.commerce.price({ min: 10, max: 500 }),
    date: faker.date.future().toISOString(),
    image: `https://picsum.photos/seed/${faker.string.uuid()}/800/600`,
    organizerId: faker.string.uuid(),
  };
};

export const generateMockDatabase = (count = 50) => {
  return {
    events: Array.from({ length: count }, createEvent),
    users: Array.from({ length: 10 }, () => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      role: faker.helpers.arrayElement(['USER', 'ORGANIZER', 'ADMIN']),
    })),
  };
};