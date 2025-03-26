const GendersTable = () => {
  return (
    <>
        <table className="table table-hover">
            <thead>
                <tr>
                <th>No.</th>
                <th>Gender</th>
                <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Male</td>
                    <td>
                    <div>
                        <button type="submit" className="btn btn-success">
                        Edit
                        </button>
                        <button type="submit" className="btn btn-danger">
                        Delete
                        </button>
                    </div>
                </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Female</td>
                    <td>
                    <div>
                        <button type="submit" className="btn btn-success">
                        Edit
                        </button>
                        <button type="submit" className="btn btn-danger">
                        Delete
                        </button>
                    </div>
                </td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Others</td>
                    <td>
                    <div>
                        <button type="submit" className="btn btn-success">
                        Edit
                        </button>
                        <button type="submit" className="btn btn-danger">
                        Delete
                        </button>
                    </div>
                </td>
                </tr>
            </tbody>
        </table>
    </>
  );
};

export default GendersTable;