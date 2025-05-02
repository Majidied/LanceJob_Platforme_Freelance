const userService = require('../../src/services/user.service');
const User = require('../../src/models/user.model');

// Mock the User model
jest.mock('../../src/models/user.model');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAllUsers should return all users', async () => {
    const mockUsers = [{ name: 'John' }, { name: 'Jane' }];
    User.find.mockResolvedValue(mockUsers);

    const result = await userService.getAllUsers();
    
    expect(User.find).toHaveBeenCalledWith({});
    expect(result).toEqual(mockUsers);
  });
});