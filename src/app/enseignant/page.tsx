"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";


type Enseignant = {
  id: number;
  name: string;
  email: string;
  dispense: boolean;
};

const EnseignantsPage = () => {
  const searchParams = useSearchParams();
  const departmentId = searchParams.get("departmentId");

  const router = useRouter();

const handleNavigateToOccupation = (enseignantId: number, enseignantName: string) => {
  router.push(`/empechement?enseignantId=${enseignantId}&enseignantName=${encodeURIComponent(enseignantName)}`);
};

  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [currentEnseignant, setCurrentEnseignant] = useState<Enseignant | null>(
    null
  );
  const [enseignantToDelete, setEnseignantToDelete] = useState<number | null>(
    null
  );

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isModifyModalOpen, setModifyModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Add state for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered enseignants based on search query
  const filteredEnseignants = enseignants.filter((ens) =>
    ens.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [newEnseignant, setNewEnseignant] = useState({
    name: "",
    email: "",
    dispense: false,
  });

  const fetchEnseignants = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8088/api/departements/${departmentId}/enseignants`
      );
      setEnseignants(response.data);
    } catch (error) {
      console.error("Error fetching enseignants:", error);
    }
  };

  useEffect(() => {
    if (departmentId) fetchEnseignants();
  }, [departmentId]);

  const handleAddEnseignant = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8088/api/enseignants",
        {
          ...newEnseignant,
          department: { id: departmentId },
        }
      );
      setEnseignants([...enseignants, response.data]);
      setAddModalOpen(false);
      setNewEnseignant({ name: "", email: "", dispense: false });
    } catch (error) {
      console.error("Error adding enseignant:", error);
    }
  };

  const handlePrepareModifyEnseignant = (enseignant: Enseignant) => {
    setCurrentEnseignant(enseignant);
    setNewEnseignant({
      name: enseignant.name,
      email: enseignant.email,
      dispense: enseignant.dispense,
    });
    setModifyModalOpen(true);
  };

  const handleModifyEnseignant = async () => {
    if (!currentEnseignant) return;

    try {
      const response = await axios.put(
        `http://localhost:8088/api/enseignants/${currentEnseignant.id}`,
        {
          ...newEnseignant,
          department: { id: departmentId },
        }
      );

      setEnseignants((prev) =>
        prev.map((ens) =>
          ens.id === currentEnseignant.id ? response.data : ens
        )
      );
      setModifyModalOpen(false);
      setCurrentEnseignant(null);
      setNewEnseignant({ name: "", email: "", dispense: false });
    } catch (error) {
      console.error("Error modifying enseignant:", error);
    }
  };

  const handlePrepareDeleteEnseignant = (enseignantId: number) => {
    setEnseignantToDelete(enseignantId);
    setDeleteModalOpen(true);
  };

  const handleDeleteEnseignant = async () => {
    if (enseignantToDelete === null) return;

    try {
      await axios.delete(
        `http://localhost:8088/api/enseignants/${enseignantToDelete}`
      );
      setEnseignants((prev) =>
        prev.filter((ens) => ens.id !== enseignantToDelete)
      );
      setDeleteModalOpen(false);
      setEnseignantToDelete(null);
    } catch (error) {
      console.error("Error deleting enseignant:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">
                Enseignants ({enseignants.length})
              </h1>
              <Link
                href="/departement"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Retour vers Departements
              </Link>
            </div>
            <Button variant="blue" onClick={() => setAddModalOpen(true)}>
              + Ajouter un enseignant
            </Button>
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <Input
              placeholder="Rechercher par nom de l'enseignant"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Enseignants Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Dispense</th>
                  <th className="px-1 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnseignants.map((enseignant) => (
                  <tr key={enseignant.id} className="hover:bg-gray-100">
                    <td
  className="px-4 py-2 text-blue-500 hover:text-blue-700 cursor-pointer"
  onClick={() => handleNavigateToOccupation(enseignant.id, enseignant.name)}
>
  {enseignant.name}
</td>

                    <td className="px-4 py-2">{enseignant.email}</td>
                    <td className="px-4 py-2">
                      {enseignant.dispense ? "Yes" : "No"}
                    </td>
                    <td className="px-1 py-2 flex space-x-2">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() =>
                          handlePrepareModifyEnseignant(enseignant)
                        }
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() =>
                          handlePrepareDeleteEnseignant(enseignant.id)
                        }
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

        {/* Add Enseignant Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent>
            <DialogTitle>Ajouter un nouvel enseignant</DialogTitle>
            <Input
              placeholder="Nom"
              value={newEnseignant.name}
              onChange={(e) =>
                setNewEnseignant({ ...newEnseignant, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={newEnseignant.email}
              onChange={(e) =>
                setNewEnseignant({ ...newEnseignant, email: e.target.value })
              }
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newEnseignant.dispense}
                onChange={(e) =>
                  setNewEnseignant({
                    ...newEnseignant,
                    dispense: e.target.checked,
                  })
                }
              />
              <span>Dispense</span>
            </label>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                Annuler
              </Button>
              <Button variant="blue" onClick={handleAddEnseignant}>
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modify Enseignant Modal */}
        <Dialog open={isModifyModalOpen} onOpenChange={setModifyModalOpen}>
          <DialogContent>
            <DialogTitle>Modifier l'enseignant</DialogTitle>
            <Input
              placeholder="Nom"
              value={newEnseignant.name}
              onChange={(e) =>
                setNewEnseignant({ ...newEnseignant, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={newEnseignant.email}
              onChange={(e) =>
                setNewEnseignant({ ...newEnseignant, email: e.target.value })
              }
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newEnseignant.dispense}
                onChange={(e) =>
                  setNewEnseignant({
                    ...newEnseignant,
                    dispense: e.target.checked,
                  })
                }
              />
              <span>Dispense</span>
            </label>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setModifyModalOpen(false)}
              >
                Annuler
              </Button>
              <Button variant="blue" onClick={handleModifyEnseignant}>
                Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <p>Êtes-vous sûr de vouloir supprimer cet enseignant ?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
              >
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteEnseignant}>
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default EnseignantsPage;
