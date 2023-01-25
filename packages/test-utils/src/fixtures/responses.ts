/* USERS */
export const fixtureUserResponse: any = {
  id: 1,
  name: 'juan',
  lastname: 'perez',
};

export const fixtureUserArrayResponse: any = [
  fixtureUserResponse,
  {
    id: 2,
    name: 'juan pablo',
    lastname: 'garcia',
  },
];

/* POSTS */
export const fixturePostResponse: any = {
  id: 1,
  title: 'test post 1',
  description: 'this is a description of post 1',
  isActive: true,
};

export const fixturePostArrayResponse: any = [
  fixturePostResponse,
  {
    id: 2,
    title: 'test post 2',
    description: 'this is a description of post 2',
    isActive: true,
  },
];
