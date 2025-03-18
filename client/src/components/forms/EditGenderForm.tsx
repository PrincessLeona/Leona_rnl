import { FormEvent } from 'react';

const EditGenderForm = () => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Updated Gender");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <div className="mb-3">
          <label htmlFor="gender">Gender</label>
          <input
            type="text"
            className="form-control"
            id="gender"
            name="gender"
          />
        </div>
        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary">
            UPDATE
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditGenderForm;