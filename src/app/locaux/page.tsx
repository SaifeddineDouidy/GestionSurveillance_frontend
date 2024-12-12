"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "@/components/Navbar";


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
  const [newLocal, setNewLocal] = useState({ nom: "", taille: 0, type: "Salle" });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editLocal, setEditLocal] = useState<Local | null>(null);


  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Fetch locaux from backend using Fetch API
  useEffect(() => {
    async function fetchLocaux() {
      try {
        const response = await fetch("http://localhost:8088/api/locaux", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include' 
          });
          
        if (response.ok) {
          const data: Local[] = await response.json();
          setLocaux(data);
        } else {
          console.error("Failed to fetch locaux. Response status:", response.status);
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
      const response = await fetch(`http://localhost:8088/api/locaux/${localToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLocaux(locaux.filter((local) => local.id !== localToDelete));
        closeDeleteModal();
      } else {
        console.error("Failed to delete session. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };
  // Handle delete local
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8088/api/locaux/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setLocaux(locaux.filter((local) => local.id !== id));
      } else {
        console.error("Failed to delete local. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting local:", error);
    }
  };
  const handleEditLocal = async () => {
    if (!editLocal) return;
  
    try {
      const response = await fetch(`http://localhost:8088/api/locaux/${editLocal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editLocal),
      });
      if (response.ok) {
        const updatedLocal = await response.json();
        setLocaux(
          locaux.map((local) => (local.id === updatedLocal.id ? updatedLocal : local))
        );
        setIsEditModalOpen(false);
        setEditLocal(null);
      } else {
        console.error("Failed to edit local. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error editing local:", error);
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

  return (
    
    <div className="bg-gray-100 p-8">
      <Navbar/>
      {/* Main Content */}
      <div className="mt-24 p-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Locaux ({filteredLocaux.length})</h1>
          <div className="flex items-center space-x-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => alert("Upload modal placeholder")}
            >
              Choisir un fichier (.xsl ou .csv)
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Ajouter un nouveau local
            </button>
          </div>
        </div>

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
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Êtes-vous sûr ?</h2>
            <p className="text-gray-600 mb-4">
              Voulez-vous vraiment supprimer cette session ? Cette action est irréversible.
            </p>
            <div className="flex justify-end">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
  onClick={handleDeleteSession}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
>
  Supprimer
</button>

            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
{isEditModalOpen && editLocal && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4">Modifier un Local</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nom</label>
        <input
          type="text"
          value={editLocal.nom}
          onChange={(e) => setEditLocal({ ...editLocal, nom: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Taille</label>
        <input
          type="number"
          value={editLocal.taille}
          onChange={(e) =>
            setEditLocal({ ...editLocal, taille: parseInt(e.target.value, 10) })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="Salle"
              checked={editLocal.type === "Salle"}
              onChange={(e) =>
                setEditLocal({ ...editLocal, type: e.target.value })
              }
              className="mr-2"
            />
            Salle
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="Amphi"
              checked={editLocal.type === "Amphi"}
              onChange={(e) =>
                setEditLocal({ ...editLocal, type: e.target.value })
              }
              className="mr-2"
            />
            Amphi
          </label>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
          onClick={() => setIsEditModalOpen(false)}
        >
          Annuler
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleEditLocal}
        >
          Enregistrer
        </button>
      </div>
    </div>
  </div>
)}


      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Ajouter un Local</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                value={newLocal.nom}
                onChange={(e) => setNewLocal({ ...newLocal, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Taille</label>
              <input
                type="number"
                value={newLocal.taille}
                onChange={(e) => setNewLocal({ ...newLocal, taille: parseInt(e.target.value, 10) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="Salle"
                    checked={newLocal.type === "Salle"}
                    onChange={(e) => setNewLocal({ ...newLocal, type: e.target.value })}
                    className="mr-2"
                  />
                  Salle
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="Amphi"
                    checked={newLocal.type === "Amphi"}
                    onChange={(e) => setNewLocal({ ...newLocal, type: e.target.value })}
                    className="mr-2"
                  />
                  Amphi
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                onClick={() => setIsAddModalOpen(false)}
              >
                Annuler
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleAddLocal}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
        
      )}
    </div>
  );

}
