export const resourceSelectOptions = {
  id: true,
  name: true,
  description: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  // NO fileUrl to save bandwidth
  subjectId: true,
  subject: {
    select: {
      name: true,
      code: true,
    }
  },
  uploadedById: true,
  uploadedByName: true,
  status: true,
  resourceType: true,
  semester: true,
  academicYear: true,
  createdAt: true,
  updatedAt: true,
};
