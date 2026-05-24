import { createBrowserRouter } from 'react-router';
import { ResourceListPage } from '../components/features/list/resource-list-page';

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        path: 'resources',
        Component: ResourceListPage,
        children: [
          {
            path: ':type',
            children: [
              {
                path: ':id',
              },
              {
                path: ':id/yaml',
              },
              {
                path: ':id/pick/:field',
              },
            ],
          },
        ],
      },
    ],
  },
]);
