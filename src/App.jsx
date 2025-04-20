import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import "./App.css";
function App() {
  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, []);
  const Data = localStorage.getItem("kanban-tasks")
    ? JSON.parse(localStorage.getItem("kanban-tasks"))
    : [];

  const [tasks, setTasks] = useState(Data);
  const [searchTerm, setSearchTerm] = useState("");
  const [newtask, setNewTask] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [readDescription, setReadDescription] = useState("");
  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, [tasks]);
  const status = [
    { id: "ToDo", title: "To Do" },
    { id: "InProgress", title: "In Progress" },
    { id: "PeerReview", title: "Peer Review" },
    { id: "Done", title: "Done" },
  ];
  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
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
          value={newtask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description..."
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <i
          class="ri-add-circle-fill"
          onClick={() => {
            if (!newtask.trim()) return;
            const newTask = {
              id: Date.now(),
              name: newtask,
              description: newDescription || "No description",
              status: "ToDo",
            };
            setTasks([...tasks, newTask]);
            setNewTask("");
            setNewDescription("");
          }}
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
                    const filtered = tasks.filter(
                      (task) =>
                        task.status === s.id &&
                        typeof task.name === "string" &&
                        task.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    );
                    if (filtered.length === 0) {
                      return <p className="no-tasks">No tasks</p>;
                    }
                    return filtered.map((task, index) => (
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
