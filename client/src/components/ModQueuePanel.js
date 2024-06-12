import React from "react";

const ModQueuePanel = ({
  queueList,
  error,
  deleteComment,
  addRandomComment,
  getRoleLabel,
}) => {
  return (
    <div className="mod-queue-panel">
      <h1 className="mod-queue-panel-title">Comment queue</h1>
      {error && <p className="error">{error}</p>}
      {queueList.length === 0 ? (
        <p className="empty-queue">The queue is empty.</p>
      ) : (
        <ul className="queue-list">
          {queueList.map((item, index) => (
            <li key={index} className="queue-item">
              <div className="queue-item-a">
                <div className="queue-item-b">
                  <strong className="mod-panel-user">{item.user}</strong>
                  <span className="mod-panel-role">
                    {getRoleLabel(item.followRole)}
                  </span>
                </div>
                <span className="mod-panel-comment">{item.comment}</span>
              </div>

              <button
                onClick={() => deleteComment(index)}
                className="delete-button"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={addRandomComment} className="add-random-button">
        Add Random Comment
      </button>
    </div>
  );
};

export default ModQueuePanel;
