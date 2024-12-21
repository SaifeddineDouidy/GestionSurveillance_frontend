"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";

type Emploi = {
  id: number;
  title: string;
  description: string;
  date: string; // Date or time field
};

export default function EmploiPage() {
  const [emplois, setEmplois] = useState<Emploi[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [emploiToDelete, setEmploiToDelete] = useState<number | null>(null);
  const [newEmploi, setNewEmploi] = useState<Partial<Emploi>>({
    title: "",
    description: "",
    date: "",
  });
  const [editEmploi, setEditEmploi] = useState<Emploi | null>(null);

  // Fetch emplois from backend
  useEffect(() => {
    async function fetchEmplois() {
      try {
        const response = await fetch("http://localhost:8088/api/emplois", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data: Emploi[] = await response.json();
          setEmplois(data);
        } else {
          console.error(
            "Failed to fetch emplois. Response status:",
            response.status
          );
        }
      } catch (error) {
        console.error("Failed to fetch emplois:", error);
      }
    }

    fetchEmplois();
  }, []);

  const handleAddEmploi = async () => {
    try {
      const response = await fetch("http://localhost:8088/api/emplois", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmploi),
      });

      if (response.ok) {
        const addedEmploi = await response.json();
        setEmplois([...emplois, addedEmploi]);
        setIsAddModalOpen(false);
        setNewEmploi({ title: "", description: "", date: "" });
      } else {
        console.error(
          "Failed to add emploi. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error adding emploi:", error);
    }
  };

  const handleEditEmploi = async () => {
    if (!editEmploi) return;

    try {
      const response = await fetch(
        `http://localhost:8088/api/emplois/${editEmploi.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editEmploi),
        }
      );

      if (response.ok) {
        const updatedEmploi = await response.json();
        setEmplois(
          emplois.map((emploi) =>
            emploi.id === updatedEmploi.id ? updatedEmploi : emploi
          )
        );
        setIsEditModalOpen(false);
        setEditEmploi(null);
      } else {
        console.error(
          "Failed to edit emploi. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error editing emploi:", error);
    }
  };

  const handleDeleteEmploi = async () => {
    if (emploiToDelete === null) return;

    try {
      const response = await fetch(
        `http://localhost:8088/api/emplois/${emploiToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setEmplois(emplois.filter((emploi) => emploi.id !== emploiToDelete));
        setIsDeleteModalOpen(false);
        setEmploiToDelete(null);
      } else {
        console.error(
          "Failed to delete emploi. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error deleting emploi:", error);
    }
  };

  return (
    <div>
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gray-50 p-12">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Emplois</h1>
              <Link
                href="/session"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Session
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden"></div>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un Emploi</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Titre
              </Label>
              <Input
                id="title"
                value={newEmploi.title}
                onChange={(e) =>
                  setNewEmploi({ ...newEmploi, title: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newEmploi.description}
                onChange={(e) =>
                  setNewEmploi({ ...newEmploi, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={newEmploi.date}
                onChange={(e) =>
                  setNewEmploi({ ...newEmploi, date: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Annuler</Button>
            </DialogClose>
            <Button variant="blue" onClick={handleAddEmploi}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un Emploi</DialogTitle>
          </DialogHeader>
          {editEmploi && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Titre
                </Label>
                <Input
                  id="edit-title"
                  value={editEmploi.title}
                  onChange={(e) =>
                    setEditEmploi({ ...editEmploi, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-description"
                  value={editEmploi.description}
                  onChange={(e) =>
                    setEditEmploi({
                      ...editEmploi,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editEmploi.date}
                  onChange={(e) =>
                    setEditEmploi({ ...editEmploi, date: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Annuler</Button>
            </DialogClose>
            <Button variant="blue" onClick={handleEditEmploi}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Êtes-vous sûr ?</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer cet emploi ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteEmploi}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
    </div>
    <Footer />
    </div>
  );
}
