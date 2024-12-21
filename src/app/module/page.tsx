"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";

type Module = {
  id: number;
  nomModule: string;
  option: number;
};

export default function ModulePage() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<number | null>(null);
  const [newModule, setNewModule] = useState({ nomModule: "", option: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModule, setEditModule] = useState<Module | null>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const optionId = searchParams.get("optionId");
  console.log(optionId);

  useEffect(() => {
    // Update the option value in newModule once optionId is available
    if (optionId) {
      setNewModule((prev) => ({
        ...prev,
        option: parseInt(optionId as string, 10),
      }));
    }
  }, [optionId]);

  const filteredModules = modules.filter((module) =>
    [module.nomModule]
      .filter((field) => typeof field === "string") // Exclude null/undefined values
      .map((field) => field.toLowerCase())
      .some((field) => field.includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    async function fetchModules() {
      try {
        const response = await fetch(
          `http://localhost:8088/api/modules/options/${optionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data: Module[] = await response.json();
          console.log(data);
          setModules(data);
        } else {
          console.error(
            "Failed to fetch Modules. Response status:",
            response.status
          );
        }
      } catch (error) {
        console.error("Failed to fetch Modules:", error);
      }
    }
    fetchModules();
  }, []);

  const openDeleteModal = (id: number) => {
    setModuleToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setModuleToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle delete session
  const handleDeleteModule = async () => {
    console.log("Module to delete", moduleToDelete);
    if (moduleToDelete === null) return;
    try {
      const response = await fetch(
        `http://localhost:8088/api/modules/${moduleToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setModules(modules.filter((module) => module.id !== moduleToDelete));
        closeDeleteModal();
      } else {
        console.error(
          "Failed to delete Modules. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error deleting Modules:", error);
    }
  };

  // Handle add Option
  const handleAddModule = async () => {
    console.log("New Module Being Sent:", newModule);
    try {
      const response = await fetch("http://localhost:8088/api/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newModule),
      });
      if (response.ok) {
        const addedModule = await response.json();
        console.log(addedModule);
        setModules([...modules, addedModule]);
        setIsAddModalOpen(false);
        setNewModule({
          nomModule: "",
          option: parseInt(optionId as string, 10),
        });
      } else {
        console.error(
          "Failed to add Module. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error adding Module:", error);
    }
  };

  // Handle edit Option
  const handleEditModule = async () => {
    if (!editModule) return;

    try {
      const response = await fetch(
        `http://localhost:8088/api/modules/${editModule.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editModule),
        }
      );
      if (response.ok) {
        const updateModule = await response.json();
        setModules(
          modules.map((module) =>
            module.id === updateModule.id ? updateModule : module
          )
        );
        setIsEditModalOpen(false);
        setEditModule(null);
      } else {
        console.error(
          "Failed to edit Module. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error editing Module:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gray-50 p-8">
        <div className="mt-4 p-10">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">
                Modules ({filteredModules.length})
              </h1>
              <Link
                href="/options"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Options
              </Link>
            </div>
            <Button variant="blue" onClick={() => setIsAddModalOpen(true)}>
              + Ajouter un nouveau module
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par Nom de module"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  <th className="px-4 py-2">Nom de module</th>
                  <th className="px-1 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredModules.map((module) => (
                  <tr
                    key={module.id}
                    className="bg-white cursor-pointer hover:bg-gray-100"
                  >
                    <td className="px-4 py-2">{module.nomModule}</td>
                    <td
                      className="px-1 py-2"
                      onClick={(e) => e.stopPropagation()} // Prevent row click event
                    >
                      <button
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => {
                          setEditModule(module); // Pre-fill the modal with selected option's data
                          setIsEditModalOpen(true); // Open the modal
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => openDeleteModal(module.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Delete Modal using Shadcn Dialog */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Êtes-vous sûr ?</DialogTitle>
                <DialogDescription>
                  Voulez-vous vraiment supprimer ce module ? Cette action est
                  irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Annuler
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteModule}
                >
                  Supprimer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Modal using Shadcn Dialog */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier un Module</DialogTitle>
              </DialogHeader>
              {editModule && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nom" className="text-right">
                      Nom de Modules
                    </Label>
                    <Input
                      id="nomModule"
                      value={editModule.nomModule}
                      onChange={(e) =>
                        setEditModule({
                          ...editModule,
                          nomModule: e.target.value,
                          option: parseInt(optionId as string, 10),
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Annuler
                  </Button>
                </DialogClose>
                <Button variant="blue" onClick={handleEditModule}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Modal using Shadcn Dialog */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Module</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nom" className="text-right">
                    Nom du module
                  </Label>
                  <Input
                    id="nomModule"
                    value={newModule.nomModule}
                    onChange={(e) =>
                      setNewModule({
                        ...newModule,
                        nomModule: e.target.value,
                        option: parseInt(optionId as string, 10),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Annuler
                  </Button>
                </DialogClose>
                <Button variant="blue" onClick={handleAddModule}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </div>
  );
}
