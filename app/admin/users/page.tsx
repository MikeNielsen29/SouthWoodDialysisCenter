import { useAuth } from '@/lib/auth'

export default function UsersPage() {
  const { users, deleteUser, toggleRole, isLoading } = useAuth()

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-6">User Management</h2>

      {isLoading ? (
        <p className="text-neutral-500">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-2xl shadow-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="p-3 text-left text-orange-600 font-medium">Control Number</th>
                <th className="p-3 text-left text-orange-600 font-medium">Name</th>
                <th className="p-3 text-left text-orange-600 font-medium">Role</th>
                <th className="p-3 text-left text-orange-600 font-medium">Email</th>
                <th className="p-3 text-left text-orange-600 font-medium">Status</th>
                <th className="p-3 text-left text-orange-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.controlNumber} className="border-b border-neutral-200">
                  <td className="p-3 font-medium">{user.controlNumber}</td>
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.role === 'Super Admin'
                          ? 'bg-orange-100 text-orange-800'
                          : user.role === 'Admin'
                            ? 'bg-teal-100 text-teal-800'
                            : user.role === 'Page Editor'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 text-xs text-orange-600 hover:bg-orange-100 rounded transition-colors"
                        onClick={() => toggleRole(user.controlNumber, 'Admin')}
                      >
                        Make Admin
                      </button>
                      <button
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded transition-colors"
                        onClick={() => deleteUser(user.controlNumber)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Button
          variant="gradient"
          className="mt-2"
        >
          Add New User
        </Button>
      </div>
    </div>
  )
}