import { FormEvent } from 'react';

const EditGenderForm = () => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Updated Gender");
  };

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <form onSubmit={handleSubmit} className="w-50"> {/* Adjust width as needed */}
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
          <button type="submit" className="btn btn-primary me-2">
            Save
          </button>
          <button type="submit" className="btn btn-primary">
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGenderForm;