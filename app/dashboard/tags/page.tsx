"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Tag as TagIcon, Edit, Trash, Check, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Tag } from "@/types"

const COLORS = [
  "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"
]

export default function TagsPage() {
  const { user } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", color: "" })

  const [newTag, setNewTag] = useState({
    name: "",
    color: "#8b5cf6"
  })

  const loadTags = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/tags?userId=${user.id}`)
      const data = await res.json()
      setTags(data || [])
    } catch (error) {
      console.error("Error loading tags:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTags()
  }, [user])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...newTag
        })
      })

      if (res.ok) {
        setIsAddOpen(false)
        setNewTag({ name: "", color: "#8b5cf6" })
        loadTags()
      }
    } catch (error) {
      console.error("Error creating tag:", error)
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditForm({ name: tag.name, color: tag.color })
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })

      if (res.ok) {
        setEditingId(null)
        loadTags()
      }
    } catch (error) {
      console.error("Error updating tag:", error)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: "", color: "" })
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus tag "${name}"?`)) return

    try {
      await fetch(`/api/tags/${id}`, {
        method: "DELETE"
      })
      loadTags()
    } catch (error) {
      console.error("Error deleting tag:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tags & Labels</h1>
          <p className="text-muted-foreground">Organize transaksi dengan tag custom</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Tag Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Tag</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Bisnis, Personal, Travel"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Warna</Label>
                <div className="flex gap-2 mt-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${newTag.color === color ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTag({ ...newTag, color })}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Simpan Tag
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : tags.length === 0 ? (
        <Card className="p-12 text-center">
          <TagIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Belum ada tag</h3>
          <p className="text-muted-foreground mb-4">
            Buat tag untuk mengorganisir transaksi dengan lebih baik
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tag Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Card key={tag.id} className="p-4">
              {editingId === tag.id ? (
                <div className="space-y-3">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-8"
                  />
                  <div className="flex gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full border ${editForm.color === color ? 'border-foreground border-2' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditForm({ ...editForm, color })}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(tag.id)}>
                      <Check className="h-3 w-3 mr-1" />
                      Simpan
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X className="h-3 w-3 mr-1" />
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(tag)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(tag.id, tag.name)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
