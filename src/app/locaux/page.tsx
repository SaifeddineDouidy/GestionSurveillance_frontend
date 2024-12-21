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
import Footer from "@/components/Footer";

type Local = {
  id: number;
  nom: string;
  taille: number;
  type: string;
};

export default function LocauxPage() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locaux, setLocaux] = useState<Local[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localToDelete, setLocalToDelete] = useState<number | null>(null);
  const [newLocal, setNewLocal] = useState({
    nom: "",
    taille: 0,
    type: "Salle",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLocal, setEditLocal] = useState<Local | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fetch locaux from backend using Fetch API
  useEffect(() => {
    async function fetchLocaux() {
      try {
        const response = await fetch("http://localhost:8088/api/locaux", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data: Local[] = await response.json();
          setLocaux(data);
        } else {
          console.error(
            "Failed to fetch locaux. Response status:",
            response.status
          );
        }
      } catch (error) {
        console.error("Failed to fetch locaux:", error);
      }
    }
    fetchLocaux();
  }, []);

  // Filter locaux based on search term
  const filteredLocaux = locaux.filter((local) =>
    [local.nom, local.taille?.toString(), local.type]
      .filter((field) => typeof field === "string") // Exclude null/undefined values
      .map((field) => field.toLowerCase())
      .some((field) => field.includes(searchTerm.toLowerCase()))
  );

  const openDeleteModal = (id: number) => {
    setLocalToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setLocalToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle delete session
  const handleDeleteSession = async () => {
    if (localToDelete === null) return;
    try {
      const response = await fetch(
        `http://localhost:8088/api/locaux/${localToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setLocaux(locaux.filter((local) => local.id !== localToDelete));
        closeDeleteModal();
      } else {
        console.error(
          "Failed to delete session. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  // Handle add local
  const handleAddLocal = async () => {
    try {
      const response = await fetch("http://localhost:8088/api/locaux", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLocal),
      });
      if (response.ok) {
        const addedLocal = await response.json();
        setLocaux([...locaux, addedLocal]);
        setIsAddModalOpen(false);
        setNewLocal({ nom: "", taille: 0, type: "Salle" });
      } else {
        console.error("Failed to add local. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error adding local:", error);
    }
  };

  // Handle edit local
  const handleEditLocal = async () => {
    if (!editLocal) return;

    try {
      const response = await fetch(
        `http://localhost:8088/api/locaux/${editLocal.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editLocal),
        }
      );
      if (response.ok) {
        const updatedLocal = await response.json();
        setLocaux(
          locaux.map((local) =>
            local.id === updatedLocal.id ? updatedLocal : local
          )
        );
        setIsEditModalOpen(false);
        setEditLocal(null);
      } else {
        console.error(
          "Failed to edit local. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error editing local:", error);
    }
  };

  const refetchLocaux = async () => {
    try {
      const response = await fetch("http://localhost:8088/api/locaux/all"); // Adjust the endpoint as per your API
      if (response.ok) {
        const locauxData = await response.json(); // Assuming the API returns a JSON array of locaux
        setLocaux(locauxData); // Update state with the fetched locaux
      } else {
        console.error("Failed to fetch locaux:", response.status);
        alert("Erreur lors de la récupération des locaux.");
      }
    } catch (error) {
      console.error("Erreur réseau lors de la récupération des locaux:", error);
      alert("Erreur réseau lors de la récupération des locaux.");
    }
  };

  // Add file upload handler
  const handleFileUpload = async () => {
    if (!uploadFile) {
      alert("Veuillez sélectionner un fichier");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const response = await fetch("http://localhost:8088/api/locaux/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.text();
        console.log("Upload succeeded:", responseData);
        alert("Fichier téléchargé avec succès!");
        await refetchLocaux();

        // Reset state or close modal if necessary
        setUploadFile(null);
        setIsUploadModalOpen(false);
      } else {
        const errorMessage = await response.text();
        console.error("Error response:", errorMessage);
        alert(`Erreur lors de l'importation : ${errorMessage}`);
      }
    } catch (error) {
      console.error("Erreur réseau lors de l'importation du fichier:", error);
      alert("Erreur réseau lors de l'importation du fichier");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gray-50 p-12 ">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">
                Locaux ({filteredLocaux.length})
              </h1>
              <Link
                href="/session"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Session
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* File Upload Dialog */}
              <Dialog
                open={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="blue"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    Choisir un fichier (.xls ou .csv)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importer des locaux</DialogTitle>
                    <DialogDescription>
                      Sélectionnez un fichier .xls ou .csv pour importer des
                      locaux
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="file" className="text-right">
                        Fichier
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".xls,.csv"
                        className="col-span-3"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            setUploadFile(files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setUploadFile(null);
                          setIsUploadModalOpen(false);
                        }}
                      >
                        Annuler
                      </Button>
                    </DialogClose>
                    <Button
                      type="button"
                      variant="blue"
                      onClick={handleFileUpload}
                      disabled={!uploadFile}
                    >
                      Importer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Existing Add Local Button */}
              <Button variant="blue" onClick={() => setIsAddModalOpen(true)}>
                + Ajouter un nouveau local
              </Button>
            </div>
          </div>

          {/* Existing table and other components remain the same */}
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par Nom, Taille, ou Type"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Taille</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-1 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocaux.map((local) => (
                  <tr key={local.id} className="bg-white">
                    <td className="px-4 py-2">{local.nom}</td>
                    <td className="px-4 py-2">{local.taille}</td>
                    <td className="px-4 py-2">{local.type}</td>
                    <td className="px-1 py-2">
                      <button
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => {
                          setEditLocal(local); // Pre-fill the modal with selected local's data
                          setIsEditModalOpen(true); // Open the modal
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => openDeleteModal(local.id)}
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
                  Voulez-vous vraiment supprimer cette session ? Cette action
                  est irréversible.
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
                  onClick={handleDeleteSession}
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
                <DialogTitle>Modifier un Local</DialogTitle>
              </DialogHeader>
              {editLocal && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nom" className="text-right">
                      Nom
                    </Label>
                    <Input
                      id="nom"
                      value={editLocal.nom}
                      onChange={(e) =>
                        setEditLocal({ ...editLocal, nom: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="taille" className="text-right">
                      Taille
                    </Label>
                    <Input
                      id="taille"
                      type="number"
                      value={editLocal.taille}
                      onChange={(e) =>
                        setEditLocal({
                          ...editLocal,
                          taille: parseInt(e.target.value, 10),
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Type</Label>
                    <RadioGroup
                      value={newLocal.type}
                      onValueChange={(value: any) =>
                        setNewLocal({ ...newLocal, type: value })
                      }
                      className="col-span-3 flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Salle"
                          id="r3"
                          className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center"
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              newLocal.type === "Salle"
                                ? "bg-blue-500"
                                : "bg-transparent"
                            }`}
                          />
                        </RadioGroupItem>
                        <Label htmlFor="r3" className="cursor-pointer">
                          Salle
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Amphi"
                          id="r4"
                          className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center"
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              newLocal.type === "Amphi"
                                ? "bg-blue-500"
                                : "bg-transparent"
                            }`}
                          />
                        </RadioGroupItem>
                        <Label htmlFor="r4" className="cursor-pointer">
                          Amphi
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Annuler
                  </Button>
                </DialogClose>
                <Button variant="blue" onClick={handleEditLocal}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Modal using Shadcn Dialog */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Local</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nom" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    value={newLocal.nom}
                    onChange={(e) =>
                      setNewLocal({ ...newLocal, nom: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taille" className="text-right">
                    Taille
                  </Label>
                  <Input
                    id="taille"
                    type="number"
                    value={newLocal.taille}
                    onChange={(e) =>
                      setNewLocal({
                        ...newLocal,
                        taille: parseInt(e.target.value, 10),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Type</Label>
                  <RadioGroup
                    value={newLocal.type}
                    onValueChange={(value: any) =>
                      setNewLocal({ ...newLocal, type: value })
                    }
                    className="col-span-3 flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Salle"
                        id="r3"
                        className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center"
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            newLocal.type === "Salle"
                              ? "bg-blue-500"
                              : "bg-transparent"
                          }`}
                        />
                      </RadioGroupItem>
                      <Label htmlFor="r3" className="cursor-pointer">
                        Salle
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Amphi"
                        id="r4"
                        className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center"
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            newLocal.type === "Amphi"
                              ? "bg-blue-500"
                              : "bg-transparent"
                          }`}
                        />
                      </RadioGroupItem>
                      <Label htmlFor="r4" className="cursor-pointer">
                        Amphi
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Annuler
                  </Button>
                </DialogClose>
                <Button variant="blue" onClick={handleAddLocal}>
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
