"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaPlus, FaSignInAlt, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";



type Session = {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
};

export default function SessionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [newSession, setNewSession] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });
  const router = useRouter();


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewSession({ type: "", startDate: "", endDate: "" });
  };

  const openEditModal = (session: Session) => {
    setEditSession(session);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditSession(null);
  };

  const openDeleteModal = (id: number) => {
    setSessionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSessionToDelete(null);
    setIsDeleteModalOpen(false);
  };
  // Fetch sessions from backend
  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch("http://localhost:8088/api/session");
        if (response.ok) {
          const data: Session[] = await response.json();
          setSessions(data);
        } else {
          console.error("Failed to fetch sessions. Response status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    }
    fetchSessions();
  }, []);

  // Handle form submission for adding a session
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8088/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSession),
      });

      if (response.ok) {
        const addedSession: Session = await response.json();
        setSessions([...sessions, addedSession]);
        closeModal();
      } else {
        console.error("Failed to add session. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error adding session:", error);
    }
  };
  // Handle editing a session
  const handleEditSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSession) return;

    try {
      const response = await fetch(`http://localhost:8088/api/session/${editSession.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editSession),
      });

      if (response.ok) {
        const updatedSession: Session = await response.json();
        setSessions(
          sessions.map((session) =>
            session.id === updatedSession.id ? updatedSession : session
          )
        );
        closeEditModal();
      } else {
        console.error("Failed to edit session. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error editing session:", error);
    }
  };

  // Handle delete session
  const handleDeleteSession = async () => {
    if (sessionToDelete === null) return;
    try {
      const response = await fetch(`http://localhost:8088/api/session/${sessionToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSessions(sessions.filter((session) => session.id !== sessionToDelete));
        closeDeleteModal();
      } else {
        console.error("Failed to delete session. Response status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 ml-2 w-auto"
            />
          </div>
          <div className="flex items-center">
            <FaSignInAlt size={20} className="text-gray-600 hover:text-gray-900 cursor-pointer" />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 pt-24">
        {/* Add Session Button */}
        <div className="flex mb-6">
          <button
            onClick={openModal}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-200 flex"
          >
            <FaPlus size={18} className="mr-2" /> Ajouter une nouvelle session
          </button>
        </div>

        {/* Sessions Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-10">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">Sessions ({sessions.length})</h2>
          </div>
          <table className="table-auto w-full text-left border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-gray-800">Type</th>
                <th className="px-4 py-2 text-gray-800">Date de début</th>
                <th className="px-4 py-2 text-gray-800">Date de fin</th>
                <th className="px-4 py-2 text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="bg-white border-b cursor-pointer hover:bg-gray-100"
                  
                >
                  <td className="px-4 py-2 text-gray-700" onClick={() => router.push(`/dashboard?sessionId=${session.id}`)}> {session.type}</td>
                  <td className="px-4 py-2 text-gray-700" onClick={() => router.push(`/dashboard?sessionId=${session.id}`)}>{session.startDate}</td>
                  <td className="px-4 py-2 text-gray-700" onClick={() => router.push(`/dashboard?sessionId=${session.id}`)}>{session.endDate}</td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-3">
                    <FaEdit
                        size={16}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        onClick={() => openEditModal(session)}
                      />
                      <FaTrash
                        size={16}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        onClick={() => openDeleteModal(session.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editSession && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Modifier la session</h2>
            <form onSubmit={handleEditSession}>
              {/* Type */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Type de session</label>
                <select
                  value={editSession.type}
                  onChange={(e) =>
                    setEditSession({ ...editSession, type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                >
                  <option value="">-- Sélectionner le type --</option>
                  <option value="Normal de printemps">Normal de printemps</option>
                  <option value="Normal d'hiver">Normal d'hiver</option>
                  <option value="Rattrapage de printemps">Rattrapage de printemps</option>
                  <option value="Rattrapage d'hiver">Rattrapage d'hiver</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Date de début</label>
                <input
                  type="date"
                  value={editSession.startDate}
                  onChange={(e) =>
                    setEditSession({ ...editSession, startDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                />
              </div>

              {/* End Date */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Date de fin</label>
                <input
                  type="date"
                  value={editSession.endDate}
                  onChange={(e) =>
                    setEditSession({ ...editSession, endDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Créer une nouvelle session</h2>
              <button onClick={closeModal} className="text-gray-600 hover:text-gray-900">
                ×
              </button>
            </div>
            <form onSubmit={handleAddSession}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Type de session</label>
                <select
                  value={newSession.type}
                  onChange={(e) =>
                    setNewSession({ ...newSession, type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                >
                  <option value="">-- Sélectionner le type --</option>
                  <option value="Normal de printemps">Normal de printemps</option>
                  <option value="Normal d'hiver">Normal d'hiver</option>
                  <option value="Rattrapage de printemps">Rattrapage de printemps</option>
                  <option value="Rattrapage d'hiver">Rattrapage d'hiver</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Date de début</label>
                <input
                  type="date"
                  value={newSession.startDate}
                  onChange={(e) =>
                    setNewSession({ ...newSession, startDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Date de fin</label>
                <input
                  type="date"
                  value={newSession.endDate}
                  onChange={(e) =>
                    setNewSession({ ...newSession, endDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Enregistrer la session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
