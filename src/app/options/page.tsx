"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "@/components/Navbar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";

interface Department {
  id: number;
  departmentName: string;
}

interface Option {
  id:number,
  nomDeFiliere: string;
  annee: string;
  nbrInscrit: number;
  departement: Department;
}

export default function OptionsPage() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [department, setDepartment] = useState<Department>();


  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<number | null>(null);
  const [newOption, setNewOption] = useState({
    nomDeFiliere: "",
    annee: "",
    nbrInscrit: 0,
    departement: { id: 0 }, // Change departmentId to { id: 0 }
  });  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOption, setEditOption] = useState<Option | null>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const router = useRouter();

  const filteredOptions = options.filter((option) =>
    [option.nomDeFiliere, option.annee, option.nbrInscrit]
      .filter((field) => typeof field === "string") // Exclude null/undefined values
      .map((field) => field.toLowerCase())
      .some((field) => field.includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const optionsResponse = await fetch("http://localhost:8088/api/options");
        const departmentsResponse = await fetch("http://localhost:8088/api/departements");

        if (optionsResponse.ok) {
          const optionsData: Option[] = await optionsResponse.json();
          setOptions(optionsData);
        }

        if (departmentsResponse.ok) {
          const departmentsData: Department[] = await departmentsResponse.json();
          console.log(departmentsData)
          setDepartments(departmentsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  const openDeleteModal = (id: number) => {
    setOptionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setOptionToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle delete session
  const handleDeleteOption = async () => {
    if (optionToDelete === null) return;
    try {
      const response = await fetch(`http://localhost:8088/api/options/${optionToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOptions(options.filter((option) => option.id !== optionToDelete));
        closeDeleteModal();
      } else {
        console.error("Failed to delete Option. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting Option:", error);
    }
  };

  // Handle add Option
  const handleAddOption = async () => {
    console.log(newOption)
    try {
      const response = await fetch("http://localhost:8088/api/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOption),
      });
      if (response.ok) {
        const addedOption = await response.json();
        setOptions([...options, addedOption]);
        setIsAddModalOpen(false);
        setNewOption({ nomDeFiliere: "", annee: "" ,nbrInscrit:0,departement: { id: 0 }});
      } else {
        console.error("Failed to add Option. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error adding Option:", error);
    }
  };

  // Handle edit Option
  const handleEditOption = async () => {
    if (!editOption) return;
  
    try {
      const response = await fetch(`http://localhost:8088/api/options/${editOption.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editOption),
      });
      if (response.ok) {
        const updatedOption = await response.json();
        setOptions(
          options.map((option) => (option.id === updatedOption.id ? updatedOption : option))
        );
        setIsEditModalOpen(false);
        setEditOption(null);
      } else {
        console.error("Failed to edit Option. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error editing Option:", error);
    }
  };


    return (
        <div className="bg-gray-100 p-8">
            <Navbar />
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Options ({filteredOptions.length})</h1>
                    <Button variant="blue" onClick={() => setIsAddModalOpen(true)}>
              + Ajouter une nouvelle option
            </Button>
                </div>

                {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par Nom de filière et niveau d'année"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

                {/* Table */}
<div className="bg-white shadow-md rounded-lg overflow-hidden">
  <table className="table-auto w-full text-left border-collapse">
    <thead className="bg-gray-200 text-gray-800">
      <tr>
        <th className="px-4 py-2">Nom de filière</th>
        <th className="px-4 py-2">Niveau d'Année</th>
        <th className="px-4 py-2">Nombre d'étudiant Inscrit</th>
        <th className="px-1 py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredOptions.map((option) => (
        <tr
          key={option.id}
          className="bg-white cursor-pointer hover:bg-gray-100"
          onClick={() => router.push(`/module?optionId=${option.id}`)}
        >
          <td className="px-4 py-2">{option.nomDeFiliere}</td>
          <td className="px-4 py-2">{option.annee}</td>
          <td className="px-4 py-2">{option.nbrInscrit}</td>
          <td
            className="px-1 py-2"
            onClick={(e) => e.stopPropagation()} // Prevent row click event
          >
            <button
              className="text-blue-500 hover:text-blue-700 mr-2"
              onClick={() => {
                setEditOption(option); // Pre-fill the modal with selected option's data
                setIsEditModalOpen(true); // Open the modal
              }}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => openDeleteModal(option.id)}
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
                Voulez-vous vraiment supprimer cette option ? Cette action est irréversible.
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
                onClick={handleDeleteOption}
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
              <DialogTitle>Modifier une Option</DialogTitle>
            </DialogHeader>
            {editOption && (
              <div className="grid gap-4 py-4">
<div className="grid grid-cols-4 items-center gap-4">
  <Label htmlFor="departmentId" className="text-right">
    Département
  </Label>
  <select
    id="departmentId"
    value={editOption?.departement.id || 0}
    onChange={(e) => setEditOption({ ...editOption, departement: {
      id: +e.target.value,
      departmentName: ""
    } })}
    className="col-span-3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
  >
    <option value={0} disabled>
      Sélectionner un département
    </option>
    {departments.map((department) => (
      <option key={department.id} value={department.id}>
        {department.departmentName}
      </option>
    ))}
  </select>
</div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nom" className="text-right">
                    Nom Filière
                  </Label>
                  <Input
                    id="nomDeFiliere"
                    value={editOption.nomDeFiliere}
                    onChange={(e) => setEditOption({ ...editOption, nomDeFiliere: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taille" className="text-right">
                    Niveau d'année
                  </Label>
                  <Input
                    id="annee"
                    type="text"
                    value={editOption.annee}
                    onChange={(e) => setEditOption({ ...editOption, annee:e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taille" className="text-right">
                    Nombre d'étudiant Inscrit
                  </Label>
                  <Input
                    id="nbrInscrit"
                    type="number"
                    value={editOption.nbrInscrit}
                    onChange={(e) => setEditOption({ ...editOption, nbrInscrit:parseInt(e.target.value) })}
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
              <Button variant="blue" onClick={handleEditOption}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Modal using Shadcn Dialog */}
        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une Option</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
  <Label htmlFor="departmentId" className="text-right">
    Département
  </Label>
  <select
    id="departmentId"
    value={newOption.departement.id}
    onChange={(e) => setNewOption({ ...newOption, departement: { id: +e.target.value }  })}
    className="col-span-3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
  >
    <option value={0} disabled>
      Sélectionner un département
    </option>
    {departments.map((department) => (
      <option key={department.id} value={department.id}>
        {department.departmentName}
      </option>
    ))}
  </select>
</div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nomDeFiliere" className="text-right">
                  Nom Filière
                </Label>
                <Input
                  id="nomDeFiliere"
                  value={newOption.nomDeFiliere}
                  onChange={(e) => setNewOption({ ...newOption, nomDeFiliere: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="annee" className="text-right">
                  Niveau d'année
                </Label>
                <Input
                  id="annee"
                  type="text"
                  value={newOption.annee}
                  onChange={(e) => setNewOption({ ...newOption, annee: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nbrInscrit" className="text-right">
                  Nombre d'étudiants Inscrits
                </Label>
                <Input
                  id="nbrInscrit"
                  type="number"
                  value={newOption.nbrInscrit}
                  onChange={(e) => setNewOption({ ...newOption, nbrInscrit: parseInt(e.target.value) })}
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
              <Button variant="blue" onClick={handleAddOption}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
            </div>
        </div>
    );
}
