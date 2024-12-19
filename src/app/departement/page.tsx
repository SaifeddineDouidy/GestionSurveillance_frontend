"use client";

import { useState, useEffect, SetStateAction } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isModifyModalOpen, setModifyModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [currentDepartment, setCurrentDepartment] = useState<{ id: number; name: string } | null>(
    null
  );
  const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null);
  // Add state for search query
const [searchQuery, setSearchQuery] = useState("");

// Filtered departments based on search query
const filteredDepartments = departments.filter((dept) =>
  dept.name.toLowerCase().includes(searchQuery.toLowerCase())
);


  const router = useRouter();

const navigateToEnseignants = (departmentId: any) => {
  if (router) {
    router.push(`/enseignant?departmentId=${departmentId}`);
  } else {
    console.error("Router not available");
  }
};


  // Fetch Departments on Component Mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:8088/api/departements");
      const formattedData = response.data.map((dept: { id: number; departmentName: string }) => ({
        id: dept.id,
        name: dept.departmentName,
      }));
      setDepartments(formattedData);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Add Department
  const handleAddDepartment = async () => {
    if (newDepartmentName.trim() === "") {
      alert("Department name is required");
      return;
    }
    try {
      const response = await axios.post("http://localhost:8088/api/departements", {
        departmentName: newDepartmentName,
      });
      const newDepartment = { id: response.data.id, name: response.data.departmentName };
      setDepartments([...departments, newDepartment]);
      setNewDepartmentName("");
      setAddModalOpen(false);
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  // Prepare Modify Department
  const handlePrepareModifyDepartment = (department: { id: number; name: string }) => {
    setCurrentDepartment(department);
    setNewDepartmentName(department.name);
    setModifyModalOpen(true);
  };

  // Modify Department
  const handleModifyDepartment = async () => {
    if (!currentDepartment || newDepartmentName.trim() === "") {
      alert("Department name is required");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:8088/api/departements/${currentDepartment.id}`,
        {
          departmentName: newDepartmentName,
          enseignants: [],
        }
      );

      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === currentDepartment.id
            ? { id: response.data.id, name: response.data.departmentName }
            : dept
        )
      );
      setModifyModalOpen(false);
      setCurrentDepartment(null);
      setNewDepartmentName("");
    } catch (error) {
      console.error("Error modifying department:", error);
    }
  };

  // Prepare Delete Confirmation
  const handlePrepareDeleteDepartment = (departmentId: number) => {
    setDepartmentToDelete(departmentId);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Department
  const handleDeleteDepartment = async () => {
    if (departmentToDelete === null) return;

    try {
      await axios.delete(`http://localhost:8088/api/departements/${departmentToDelete}`);
      setDepartments((prev) => prev.filter((dept) => dept.id !== departmentToDelete));
      setDeleteModalOpen(false);
      setDepartmentToDelete(null);
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="p-8 bg-gray-50 min-h-screen">
      <Navbar />
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Departements ({departments.length})</h1>
          <div className="flex space-x-2">
            <Button variant="blue" onClick={() => alert("File upload placeholder")}>
              Choisir un fichier (.xls ou .csv)
            </Button>
            <Button variant="blue" onClick={() => setAddModalOpen(true)}>
              + Ajouter un nouveau departement
            </Button>
          </div>
        </div>

        {/* Search Input */}
<div className="mb-4">
  <Input
    placeholder="Rechercher par nom du département"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>

        {/* Departments Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="table-auto w-full text-left border-collapse">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">ID</th>
                <th className="px-1 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((department) => (
                <tr
                  key={department.id}
                  className="bg-white cursor-pointer hover:bg-gray-100"
                  onClick={() => navigateToEnseignants(department.id)}
                >
                  <td className="px-4 py-2">{department.name}</td>
                  <td className="px-4 py-2">{department.id}</td>
                  <td className="px-1 py-2 flex space-x-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrepareModifyDepartment(department);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrepareDeleteDepartment(department.id);
                      }}
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

      {/* Add Department Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogTitle>Ajouter un nouveau département</DialogTitle>
          <Input
            placeholder="Nom du département"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
          />
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="blue" onClick={handleAddDepartment}>Ajouter</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modify Department Modal */}
      <Dialog open={isModifyModalOpen} onOpenChange={setModifyModalOpen}>
        <DialogContent>
          <DialogTitle>Modifier le département</DialogTitle>
          <Input
            placeholder="Nom du département"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
          />
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setModifyModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="blue" onClick={handleModifyDepartment}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <p className="text-gray-600">Êtes-vous sûr de vouloir supprimer ce département ?</p>
          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteDepartment}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
};

export default DepartmentsPage;
