
interface QueueItem {
  user: string;
  comment: string;
  followRole: string;
}

const ModQueuePanel = (props: {
  queueList: QueueItem[],
  error: any,
  deleteComment: (index: number) => void,
  addRandomComment: () => void,
  getRoleLabel: (role: string) => string,
}) => {
  const showAddRandomCommentButton = false; // You can change this to false to hide the button

  return (
    <div className="mod-queue-panel">
      <h1 className="mod-queue-panel-title">Comment queue</h1>
      {props.error && <p className="error">{props.error}</p>}
      {props.queueList.length === 0 ? (
        <p className="empty-queue">The queue is empty.</p>
      ) : (
        <ul className="queue-list">
          {props.queueList.map((item: QueueItem, index: number) => (
            <li key={index} className="queue-item">
              <div className="queue-item-a">
                <div className="queue-item-b">
                  <strong className="mod-panel-user">{item.user}</strong>
                  <span className="mod-panel-role">
                    {props.getRoleLabel(item.followRole)}
                  </span>
                </div>
                <span className="mod-panel-comment">{item.comment}</span>
              </div>

              <button
                onClick={() => props.deleteComment(index)}
                className="delete-button"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
      {showAddRandomCommentButton && (
        <button onClick={props.addRandomComment} className="add-random-button">
          Add Random Comment
        </button>
      )}
    </div>
  );
};

export default ModQueuePanel;
