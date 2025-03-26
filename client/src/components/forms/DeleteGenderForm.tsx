import { FormEvent } from 'react';
import { Link } from 'react-router-dom'; // Make sure to import Link

const DeleteGenderForm = () => {
  const handleDelete = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle the deletion logic here
    console.log("Gender deleted");
  };

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <form onSubmit={handleDelete} className="w-50"> {/* Adjust width as needed */}
        <div className="form-group mb-3">
          <label htmlFor="gender">Gender</label>
          <input
            type="text"
            className="form-control"
            id="gender"
            name="gender"
          />
        </div>
        <div className="d-flex justify-content-end">
          <Link to="/" className="btn btn-secondary me-2">
            NO
          </Link>
          <button type="submit" className="btn btn-danger">
            YES
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteGenderForm;