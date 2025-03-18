import DeleteGenderForm from "../../components/forms/DeleteGenderForm";
import MainLayout from "../layout/MainLayout";

const DeleteGender = () => {
  const content = (
    <>
      <h2>Delete Gender</h2>
      <DeleteGenderForm />
    </>
  );

  return <MainLayout content={content} />;
};

export default DeleteGender;