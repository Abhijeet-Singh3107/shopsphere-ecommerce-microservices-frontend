import { useState, useEffect } from 'react';
import { getCategories } from '../../api/endpoints.js';

const EMPTY = { name: '', description: '', price: '', stock: '', imageUrl: '', featured: false, categoryId: '' };

export default function ProductForm({ initialValues = {}, onSubmit }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialValues });
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        imageUrl: form.imageUrl || null,
        featured: form.featured,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name" required>
        <input className={input} value={form.name} onChange={set('name')} required />
      </Field>
      <Field label="Description">
        <textarea className={`${input} resize-none`} rows={3} value={form.description} onChange={set('description')} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Price" required>
          <input className={input} type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required />
        </Field>
        <Field label="Stock" required>
          <input className={input} type="number" min="0" step="1" value={form.stock} onChange={set('stock')} required />
        </Field>
      </div>
      <Field label="Image URL">
        <input className={input} value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
      </Field>
      <Field label="Category">
        <select className={input} value={form.categoryId} onChange={set('categoryId')}>
          <option value="">— Select category —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.featured} onChange={set('featured')} className="h-4 w-4 rounded border-gray-300" />
        Featured product
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
      >
        {submitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500';
