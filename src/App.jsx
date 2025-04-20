import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import "./App.css";

function App() {
  // Load tasks from localStorage, or use an empty array if none exist
  const initialTasks = JSON.parse(localStorage.getItem("kanban-tasks")) || [];

  const [tasks, setTasks] = useState(initialTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [readDescription, setReadDescription] = useState("");

  // Memoize tasks based on the search term to avoid unnecessary filtering on each render
  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  // Store tasks in localStorage only when they change
  useEffect(() => {
    if (tasks.length) {
      localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const status = [
    { id: "ToDo", title: "To Do" },
    { id: "InProgress", title: "In Progress" },
    { id: "PeerReview", title: "Peer Review" },
    { id: "Done", title: "Done" },
  ];

  // Handle task drag-and-drop
  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return; // if dropped outside of the list, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return; // if the task is dropped in the same position, do nothing
    }

    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(
      updatedTasks.findIndex(
        (t) =>
          t.status === source.droppableId &&
          tasks.filter((tsk) => tsk.status === source.droppableId)[source.index]
            .id === t.id
      ),
      1
    );

    movedTask.status = destination.droppableId;
    const newList = updatedTasks.filter(
      (t) => t.status === destination.droppableId
    );
    newList.splice(destination.index, 0, movedTask);

    const finalTasks = [
      ...updatedTasks.filter((t) => t.status !== destination.droppableId),
      ...newList,
    ];

    setTasks(finalTasks);
  };

  // Add a new task to the list
  const addNewTask = () => {
    if (!newTask.trim()) return; // Do nothing if no task is entered
    const task = {
      id: Date.now(),
      name: newTask,
      description: newDescription || "No description",
      status: "ToDo",
    };
    setTasks((prevTasks) => [...prevTasks, task]);
    setNewTask("");
    setNewDescription("");
  };

  return (
    <div className="App">
      <h2>KanbanBoard</h2>
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="new-task">
        <input
          type="text"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description..."
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <i
          className="ri-add-circle-fill"
          onClick={addNewTask}
        ></i>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {status.map((s) => (
            <Droppable key={s.id} droppableId={s.id}>
              {(provided) => (
                <div
                  className="status"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3>{s.title}</h3>
                  {(() => {
                    const filteredStatusTasks = filteredTasks.filter(
                      (task) => task.status === s.id
                    );
                    if (filteredStatusTasks.length === 0) {
                      return <p className="no-tasks">No tasks</p>;
                    }
                    return filteredStatusTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="card"
                            onMouseOver={() =>
                              setReadDescription(task.description)
                            }
                            onMouseOut={() => setReadDescription("")}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <p className="title">{task.name}</p>
                            <p className="desc">{task.description}</p>
                          </div>
                        )}
                      </Draggable>
                    ));
                  })()}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <div className="read_description">
        <i className="ri-information-line"></i>
        <p>{readDescription}</p>
      </div>
    </div>
  );
}

export default App;
