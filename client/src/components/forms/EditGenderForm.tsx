import { FormEvent } from 'react';
import { Link } from 'react-router-dom';

const EditGenderForm = () => {
  const handleEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Gender edited");
  };

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <form onSubmit={handleEdit} className="w-50"> {/* Set width to 50% */}
        <div className="form-group mb-3">
          <label htmlFor="gender">Gender</label>
          <input
            type="text"
            className="form-control"
            name="gender"
            id="gender"
          />
        </div>
        <div className="d-flex justify-content-end">
          <Link to="/" className="btn btn-secondary me-2">
            Back
          </Link>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGenderForm;