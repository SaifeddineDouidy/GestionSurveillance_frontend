"use client";

import { useState, useEffect } from "react";
import {
  FaEdit,
  FaPlus,
  FaSignInAlt,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Session = {
  id: number;
  type: string;
  isValid: boolean;
  startDate: string;
  endDate: string;
  morningStart1: string;
  morningEnd1: string;
  morningStart2: string;
  morningEnd2: string;
  afternoonStart1: string;
  afternoonEnd1: string;
  afternoonStart2: string;
  afternoonEnd2: string;
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
    isValid: "false",
    morningStart1: "08:00",
    morningEnd1: "10:00",
    morningStart2: "10:00",
    morningEnd2: "12:00",
    afternoonStart1: "14:00",
    afternoonEnd1: "16:00",
    afternoonStart2: "16:00",
    afternoonEnd2: "18:00",
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
          console.error(
            "Failed to fetch sessions. Response status:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    }
    fetchSessions();
  }, []); // Keep this empty array to run only on initial mount

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
        console.error(
          "Failed to add session. Response status:",
          response.status
        );
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
      const response = await fetch(
        `http://localhost:8088/api/session/${editSession.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editSession),
        }
      );

      if (response.ok) {
        const updatedSession: Session = await response.json();
        setSessions(
          sessions.map((session) =>
            session.id === updatedSession.id ? updatedSession : session
          )
        );
        closeEditModal();
      } else {
        console.error(
          "Failed to edit session. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error editing session:", error);
    }
  };

  // Handle delete session
  const handleDeleteSession = async () => {
    if (sessionToDelete === null) return;
    try {
      const response = await fetch(
        `http://localhost:8088/api/session/${sessionToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSessions(
          sessions.filter((session) => session.id !== sessionToDelete)
        );
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSession((prevSession) => ({
      ...prevSession,
      [name]: value,
    }));
  };

  const refetchSessions = async () => {
    try {
      const response = await fetch("http://localhost:8088/api/session");
      if (response.ok) {
        const data: Session[] = await response.json();
        setSessions(data);
      } else {
        console.error(
          "Failed to fetch sessions. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const toggleValidation = async (sessionId: number, isValid: boolean) => {
    try {
      const response = await fetch(
        `http://localhost:8088/api/session/${sessionId}/validate`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isValid }),
        }
      );

      if (response.ok) {
        await refetchSessions(); // Refetch sessions after successful validation toggle
      } else {
        throw new Error("Failed to toggle validation");
      }
    } catch (error) {
      console.error("Error toggling validation:", error);
      alert("An error occurred while updating the validation status.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-14 ml-2 w-auto" />
          </div>
          <div className="flex items-center">
            <FaSignInAlt
              size={20}
              className="text-gray-600 hover:text-gray-900 cursor-pointer"
            />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 pt-10">
        {/* Modal */}
        <div className="container mx-auto px-4 pt-24">
          {/* Add Session Button with Dialog */}
          <div className="flex mb-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="blue">
                  <FaPlus className="mr-2" /> Ajouter une nouvelle session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle session</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleAddSession} className="grid gap-4 py-4">
                  {/* Session Type */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type de session
                    </Label>
                    <Select
                      value={newSession.type}
                      onValueChange={(value) =>
                        setNewSession({ ...newSession, type: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal de printemps">
                          Normal de printemps
                        </SelectItem>
                        <SelectItem value="Normal d'hiver">
                          Normal d'hiver
                        </SelectItem>
                        <SelectItem value="Rattrapage de printemps">
                          Rattrapage de printemps
                        </SelectItem>
                        <SelectItem value="Rattrapage d'hiver">
                          Rattrapage d'hiver
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">
                      Date de début
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newSession.startDate}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          startDate: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>

                  {/* End Date */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">
                      Date de fin
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newSession.endDate}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          endDate: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>

                  {/* Creneaux Section */}
                  <div className="grid gap-2">
                    <h3 className="text-md font-semibold text-gray-700">
                      Creneaux
                    </h3>

                    {/* Morning Creneaux */}
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        type="time"
                        value={newSession.morningStart1}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            morningStart1: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="time"
                        value={newSession.morningEnd1}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            morningEnd1: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="time"
                        value={newSession.morningStart2}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            morningStart2: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="time"
                        value={newSession.morningEnd2}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            morningEnd2: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Afternoon Creneaux */}
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        type="time"
                        value={newSession.afternoonStart1}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            afternoonStart1: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="time"
                        value={newSession.afternoonEnd1}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            afternoonEnd1: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="time"
                        value={newSession.afternoonStart2}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            afternoonStart2: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="time"
                        value={newSession.afternoonEnd2}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            afternoonEnd2: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Dialog Footer */}
                  <div className="flex justify-end space-x-2 mt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Annuler
                      </Button>
                    </DialogClose>
                    <Button type="submit">Enregistrer la session</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-10">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Sessions ({sessions.length})
            </h2>
          </div>
          <table className="table-auto w-full text-left border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-gray-800">Type</th>
                <th className="px-4 py-2 text-gray-800">Date de début</th>
                <th className="px-4 py-2 text-gray-800">Date de fin</th>
                <th className="px-4 py-2 text-gray-800">Actions</th>
              </tr>
            </thead><tbody>
  {sessions.map((session) => (
    <tr
      key={session.id}
      className={`border-b cursor-pointer ${
        session.valid
          ? "bg-gray-200 text-gray-500" // Disabled row styling
          : "bg-white hover:bg-gray-100"
      }`}
      onClick={() => {
        if (!session.valid) {
          router.push(`/dashboard?sessionId=${session.id}`);
        }
      }}
    >
      <td className="px-4 py-2">{session.type}</td>
      <td className="px-4 py-2">{session.startDate}</td>
      <td className="px-4 py-2">{session.endDate}</td>
      <td className="px-4 py-2">
        <div className="flex space-x-3">
          {/* Edit Icon with reduced opacity when validated */}
          <FaEdit
            size={16}
            className={`${
              session.valid
                ? "text-blue-300 cursor-not-allowed"
                : "text-blue-500 hover:text-blue-700 cursor-pointer"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!session.valid) openEditModal(session);
            }}
          />

          {/* Delete Icon with reduced opacity when validated */}
          <FaTrash
            size={16}
            className={`${
              session.valid
                ? "text-red-300 cursor-not-allowed"
                : "text-red-500 hover:text-red-700 cursor-pointer"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!session.valid) openDeleteModal(session.id);
            }}
          />

          {/* Validation Toggle */}
          {session.valid ? (
            <div className="flex items-center">
              <FaCheckCircle
                size={16}
                className="text-green-500 hover:text-green-700 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleValidation(session.id, false);
                }}
              />
            </div>
          ) : (
            <div className="flex items-center">
              <FaTimesCircle
                size={16}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleValidation(session.id, true);
                }}
              />
            </div>
          )}
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
  <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>Modifier la session</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleEditSession} className="grid gap-4 py-4">
        {/* Session Type */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">
            Type de session
          </Label>
          <Select
            value={editSession.type}
            onValueChange={(value) =>
              setEditSession({ ...editSession, type: value })
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal de printemps">
                Normal de printemps
              </SelectItem>
              <SelectItem value="Normal d'hiver">Normal d'hiver</SelectItem>
              <SelectItem value="Rattrapage de printemps">
                Rattrapage de printemps
              </SelectItem>
              <SelectItem value="Rattrapage d'hiver">
                Rattrapage d'hiver
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="startDate" className="text-right">
            Date de début
          </Label>
          <Input
            id="startDate"
            type="date"
            value={editSession.startDate}
            onChange={(e) =>
              setEditSession({ ...editSession, startDate: e.target.value })
            }
            className="col-span-3"
          />
        </div>

        {/* End Date */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="endDate" className="text-right">
            Date de fin
          </Label>
          <Input
            id="endDate"
            type="date"
            value={editSession.endDate}
            onChange={(e) =>
              setEditSession({ ...editSession, endDate: e.target.value })
            }
            className="col-span-3"
          />
        </div>

        {/* Creneaux Section */}
        <div className="grid gap-2">
          <h3 className="text-md font-semibold text-gray-700">Creneaux</h3>

          {/* Morning Creneaux */}
          <div className="grid grid-cols-4 gap-2">
            <Input
              type="time"
              value={editSession.morningStart1}
              onChange={(e) =>
                setEditSession({
                  ...editSession,
                  morningStart1: e.target.value,
                })
              }
            />
            <Input
              type="time"
              value={editSession.morningEnd1}
              onChange={(e) =>
                setEditSession({
                  ...editSession,
                  morningEnd1: e.target.value,
                })
              }
            />
            <Input
              type="time"
              value={editSession.morningStart2}
              onChange={(e) =>
                setEditSession({
                  ...editSession,
                  morningStart2: e.target.value,
                })
              }
            />
            <Input
              type="time"
              value={editSession.morningEnd2}
              onChange={(e) =>
                setEditSession({
                  ...editSession,
                  morningEnd2: e.target.value,
                })
              }
            />
          </div>

          {/* Afternoon Creneaux */}
          <div className="grid grid-cols-4 gap-2">
            <Input
              type="time"
              value={editSession.afternoonStart1}
              onChange={(e) =>
                setEditSession({
                  ...editSession,
                  afternoonStart1: e.target.value,
                })
              }
            />
            <Input
              type="time"
              value={editSession.afternoonEnd1}
              onChange={(e) =>
                setEditSession({
                  ...editSession,
                  afternoonEnd1: e.target.value,
                })
              }
            />
            <Input
              type="time"
              value={editSession.afternoonStart2}
              onChange={(e) =>
                setEditSession({
                  ...editSession,
                  afternoonStart2: e.target.value,
                })
              }
            />
            <Input
              type="time"
              value={editSession.afternoonEnd2}
              onChange={(e) =>
                setEditSession({
                  ...editSession,
                  afternoonEnd2: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Dialog Footer */}
        <div className="flex justify-end space-x-2 mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </DialogClose>
          <Button type="submit">Enregistrer les modifications</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
)}

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={closeDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer cette session ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteModal}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
