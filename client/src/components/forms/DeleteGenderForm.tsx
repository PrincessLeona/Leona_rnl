import { FormEvent } from 'react';

const DeleteGenderForm = () => {
  const handleDelete = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle the deletion logic here
    console.log("Gender deleted");
  };

  return (
    <form onSubmit={handleDelete}>
      <div className="form-group">
        <p>Are you sure you want to delete this gender?</p>
        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-danger">
            DELETE
          </button>
        </div>
      </div>
    </form>
  );
};

export default DeleteGenderForm;