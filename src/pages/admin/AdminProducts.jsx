import { useEffect, useState } from 'react';
import {
  getAdminProducts, createProduct, updateProduct, deleteProduct,
} from '../../api/endpoints.js';
import ProductForm from '../../components/admin/ProductForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useNotification } from '../../hooks/useNotification.js';
import { formatINR } from '../../utils/currency.js';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', product }
  const [confirmDelete, setConfirmDelete] = useState(null); // product id
  const { notify } = useNotification();

  const load = (p = page) => {
    setLoading(true);
    getAdminProducts(p, 10)
      .then((data) => {
        setProducts(data.content ?? data ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch((err) => notify(err.message ?? 'Failed to load products', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const handleCreate = async (data) => {
    try {
      await createProduct(data);
      notify('Product created', 'success');
      setModal(null);
      load(page);
    } catch (err) {
      notify(err.message ?? 'Failed to create product', 'error');
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateProduct(modal.product.id, data);
      notify('Product updated', 'success');
      setModal(null);
      load(page);
    } catch (err) {
      notify(err.message ?? 'Failed to update product', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(confirmDelete);
      notify('Product deleted', 'success');
      setConfirmDelete(null);
      load(page);
    } catch (err) {
      notify(err.message ?? 'Failed to delete product', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Create
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.categoryName}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatINR(p.price)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.stock}</td>
                    <td className="px-4 py-3 text-gray-600">{p.featured ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setModal({ mode: 'edit', product: p })}
                        className="mr-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <Modal title={modal.mode === 'create' ? 'Create Product' : 'Edit Product'} onClose={() => setModal(null)}>
          <ProductForm
            initialValues={modal.mode === 'edit' ? modal.product : {}}
            onSubmit={modal.mode === 'create' ? handleCreate : handleEdit}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <Modal title="Delete Product" onClose={() => setConfirmDelete(null)}>
          <p className="mb-6 text-sm text-gray-700">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
