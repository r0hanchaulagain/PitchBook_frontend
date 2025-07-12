import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Edit, Camera, MapPin, Settings, XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useFutsalDetails } from "@hooks/useFutsalDetails";
import { useUpdateFutsal } from "@hooks/useUpdateFutsal";
import { toast } from "sonner";
import { uploadFutsalImage } from "@lib/apiWrapper";

const futsalId = import.meta.env.VITE_FUTSAL_ID;

export default function Futsal() {
  const { data, isLoading, error } = useFutsalDetails(futsalId);
  const updateFutsal = useUpdateFutsal(futsalId);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editingAmenityIdx, setEditingAmenityIdx] = useState<number | null>(
    null,
  );
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<(File | null)[]>([]);
  const [removedImageIndexes, setRemovedImageIndexes] = useState<number[]>([]);

  // Type for API response
  type FutsalApiResponse = { futsal?: any };

  useEffect(() => {
    const futsalData = (data as FutsalApiResponse | undefined)?.futsal;
    if (futsalData) setForm(futsalData);
  }, [data]);

  useEffect(() => {
    if (editMode) {
      setLocalImages(form.images ? [...form.images] : []);
      setNewImageFiles([]);
      setRemovedImageIndexes([]);
    }
  }, [editMode, form.images]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  // Handler for contact info
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      contactInfo: {
        ...form.contactInfo,
        [e.target.name]: e.target.value,
      },
    });
  };

  // Handler for operating hours
  const handleOperatingHoursChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const [period, field] = e.target.name.split(".");
    setForm({
      ...form,
      operatingHours: {
        ...form.operatingHours,
        [period]: {
          ...form.operatingHours?.[period],
          [field]: e.target.value,
        },
      },
    });
  };

  // Handler for pricing modifiers
  const handlePricingModifierChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const [modifier, field] = e.target.name.split(".");
    let value: any =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (field === "percentage") value = parseFloat(value);
    setForm({
      ...form,
      pricing: {
        ...form.pricing,
        modifiers: {
          ...form.pricing?.modifiers,
          [modifier]: {
            ...form.pricing?.modifiers?.[modifier],
            [field]: value,
          },
        },
      },
    });
  };

  // Handler for image file change (staged, not uploaded yet)
  const handleImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const updatedImages = [...localImages];
      updatedImages[index] = url;
      setLocalImages(updatedImages);
      const updatedFiles = [...newImageFiles];
      updatedFiles[index] = file;
      setNewImageFiles(updatedFiles);
    }
  };

  // Handler to trigger file input
  const triggerImageInput = (index: number) => {
    const input = document.getElementById(
      `futsal-image-input-${index}`,
    ) as HTMLInputElement;
    if (input) input.click();
  };

  // Handler for amenities
  const handleAmenityEdit = (index: number) => {
    setEditingAmenityIdx(index);
  };

  const handleAmenityEditChange = (index: number, value: string) => {
    const newAmenities = [...(form.amenities || [])];
    newAmenities[index] = value;
    setForm({ ...form, amenities: newAmenities });
  };

  const handleAmenityEditBlur = () => {
    setEditingAmenityIdx(null);
  };

  const handleAddAmenity = () => {
    setForm({ ...form, amenities: [...(form.amenities || []), ""] });
  };

  const handleRemoveAmenity = (index: number) => {
    const newAmenities = [...(form.amenities || [])];
    newAmenities.splice(index, 1);
    setForm({ ...form, amenities: newAmenities });
  };

  // Handler to add a new image slot (up to 4)
  const handleAddImage = () => {
    if (localImages.length < 4) {
      setLocalImages([...localImages, ""]);
      setNewImageFiles([...newImageFiles, null]);
    }
  };

  // Handler to remove an image (staged, not removed yet)
  const handleRemoveImage = (index: number) => {
    setRemovedImageIndexes([...removedImageIndexes, index]);
    const updatedImages = localImages.filter((_, i) => i !== index);
    setLocalImages(updatedImages);
    const updatedFiles = newImageFiles.filter((_, i) => i !== index);
    setNewImageFiles(updatedFiles);
  };

  // On save, upload new images and update form.images
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedImages = form.images ? [...form.images] : [];
    // Remove images marked for removal
    removedImageIndexes
      .sort((a, b) => b - a)
      .forEach((idx) => {
        updatedImages.splice(idx, 1);
      });
    // Upload new images and replace local URLs with server URLs
    for (let i = 0; i < newImageFiles.length; i++) {
      const file = newImageFiles[i];
      if (file) {
        try {
          const response = await uploadFutsalImage(futsalId, file);
          updatedImages[i] = response.url;
        } catch (error) {
          toast.error("Error uploading image.");
          return;
        }
      }
    }
    // Update form and submit
    updateFutsal.mutate(
      { ...form, images: updatedImages },
      {
        onSuccess: () => {
          setEditMode(false);
          toast.success("Futsal updated!");
        },
        onError: () => {
          toast.error("Error updating futsal.");
        },
      },
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading futsal details.</div>;

  const futsal = form;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {editMode ? (
              <input
                name="name"
                value={futsal.name || ""}
                onChange={handleChange}
                className="text-2xl font-bold border rounded px-2 py-1"
              />
            ) : (
              futsal.name
            )}
          </h2>
          <p className="text-gray-600 flex items-center gap-2">
            Status:
            <Badge variant={futsal.isActive ? "default" : "secondary"}>
              {futsal.isActive ? "Active" : "Inactive"}
            </Badge>
          </p>
        </div>
        <Button onClick={() => setEditMode((v) => !v)}>
          <Edit className="h-4 w-4 mr-2" />
          {editMode ? "Cancel" : "Edit Details"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Futsal Images</CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div className="grid grid-cols-3 gap-4 min-h-[340px]">
                    {localImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative h-48 w-full bg-gray-200 rounded-md flex items-center justify-center overflow-hidden"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={`Futsal image ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Camera className="h-8 w-8 text-gray-400" />
                        )}
                        <input
                          id={`futsal-image-input-${index}`}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleImageChange(index, e)}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            type="button"
                            onClick={() => triggerImageInput(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {localImages.length < 4 && (
                      <div
                        className="flex items-center justify-center h-48 w-full rounded-md border-dashed border-2 border-gray-300 cursor-pointer"
                        onClick={handleAddImage}
                      >
                        <span className="text-gray-400 text-2xl">+</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 min-h-[340px]">
                    {Array.isArray(futsal.images) &&
                      futsal.images.map((image: string, index: number) => (
                        <div
                          key={index}
                          className="relative h-48 w-full bg-gray-200 rounded-md flex items-center justify-center overflow-hidden"
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={`Futsal image ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Camera className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <textarea
                    name="info"
                    value={futsal.info || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 min-h-[80px]"
                  />
                ) : (
                  <>
                    <p className="text-accent leading-relaxed">{futsal.info}</p>
                  </>
                )}
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Amenities</h4>
                  {editMode ? (
                    <div className="flex flex-wrap gap-2 items-end">
                      {Array.isArray(futsal.amenities) &&
                        futsal.amenities.map(
                          (amenity: string, index: number) => (
                            <div key={index} className="relative group">
                              {/* Cross icon for delete */}
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 z-10 bg-destructive text-white rounded-full p-0.5 shadow hover:bg-destructive/80 opacity-80 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveAmenity(index)}
                                tabIndex={-1}
                              >
                                <XIcon className="w-3 h-3" />
                              </button>
                              {/* Badge for amenity, click to edit */}
                              {editingAmenityIdx === index ? (
                                <input
                                  type="text"
                                  value={amenity}
                                  autoFocus
                                  onChange={(e) =>
                                    handleAmenityEditChange(
                                      index,
                                      e.target.value,
                                    )
                                  }
                                  onBlur={handleAmenityEditBlur}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleAmenityEditBlur();
                                  }}
                                  className="border rounded px-2 py-2 text-xs font-medium w-fit"
                                />
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="cursor-pointer select-none pr-5 min-w-[60px] min-h-[20px]"
                                  onClick={() => handleAmenityEdit(index)}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleAmenityEdit(index);
                                  }}
                                >
                                  {amenity}
                                </Badge>
                              )}
                            </div>
                          ),
                        )}
                      {/* Add badge */}
                      <button
                        type="button"
                        className="ml-2 px-2 py-0.5 border border-dashed border-primary text-primary rounded-md text-xs font-medium hover:bg-primary/10 transition-colors"
                        onClick={handleAddAmenity}
                      >
                        + Add
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(futsal.amenities) &&
                        futsal.amenities.map(
                          (amenity: string, index: number) => (
                            <Badge key={index}>{amenity}</Badge>
                          ),
                        )}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Side</h4>
                  {editMode ? (
                    <select
                      name="side"
                      value={futsal.side || ""}
                      onChange={handleSelectChange}
                      className="w-24 border rounded px-2 py-1"
                    >
                      <option value="">Select</option>
                      <option value={5}>5</option>
                      <option value={6}>6</option>
                      <option value={7}>7</option>
                    </select>
                  ) : (
                    <span>{futsal.side}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Location
                  </label>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {editMode ? (
                        <input
                          name="location.address"
                          value={futsal.location?.address || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              location: {
                                ...form.location,
                                address: e.target.value,
                              },
                            })
                          }
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        <span>{futsal.location?.address}</span>
                      )}
                    </div>
                    {futsal.location?.city && (
                      <div className="text-xs text-muted-foreground ml-6">
                        {futsal.location.city}
                      </div>
                    )}
                    {futsal.location?.coordinates?.coordinates && (
                      <div className="text-xs text-muted-foreground ml-6">
                        Coordinates:{" "}
                        {futsal.location.coordinates.coordinates.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Contact Info
                  </label>
                  <div className="flex flex-col gap-1 mt-1 ml-6">
                    {editMode ? (
                      <>
                        <input
                          name="phone"
                          value={futsal.contactInfo?.phone || ""}
                          onChange={handleContactChange}
                          className="text-xs border rounded px-2 py-1 mb-1"
                          placeholder="Phone"
                        />
                        <input
                          name="email"
                          value={futsal.contactInfo?.email || ""}
                          onChange={handleContactChange}
                          className="text-xs border rounded px-2 py-1"
                          placeholder="Email"
                        />
                      </>
                    ) : (
                      <>
                        <div className="text-xs">
                          Phone: {futsal.contactInfo?.phone}
                        </div>
                        <div className="text-xs">
                          Email: {futsal.contactInfo?.email}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {futsal.operatingHours && (
                  <>
                    <div className="text-xs flex items-center gap-2">
                      Weekdays:
                      {editMode ? (
                        <>
                          <input
                            type="time"
                            name="weekdays.open"
                            value={futsal.operatingHours.weekdays?.open || ""}
                            onChange={handleOperatingHoursChange}
                            className="border rounded px-1 py-0.5 text-xs"
                          />
                          -
                          <input
                            type="time"
                            name="weekdays.close"
                            value={futsal.operatingHours.weekdays?.close || ""}
                            onChange={handleOperatingHoursChange}
                            className="border rounded px-1 py-0.5 text-xs"
                          />
                        </>
                      ) : (
                        <>
                          {futsal.operatingHours.weekdays?.open} -{" "}
                          {futsal.operatingHours.weekdays?.close}
                        </>
                      )}
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      Weekends:
                      {editMode ? (
                        <>
                          <input
                            type="time"
                            name="weekends.open"
                            value={futsal.operatingHours.weekends?.open || ""}
                            onChange={handleOperatingHoursChange}
                            className="border rounded px-1 py-0.5 text-xs"
                          />
                          -
                          <input
                            type="time"
                            name="weekends.close"
                            value={futsal.operatingHours.weekends?.close || ""}
                            onChange={handleOperatingHoursChange}
                            className="border rounded px-1 py-0.5 text-xs"
                          />
                        </>
                      ) : (
                        <>
                          {futsal.operatingHours.weekends?.open} -{" "}
                          {futsal.operatingHours.weekends?.close}
                        </>
                      )}
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      Holidays:
                      {editMode ? (
                        <>
                          <input
                            type="time"
                            name="holidays.open"
                            value={futsal.operatingHours.holidays?.open || ""}
                            onChange={handleOperatingHoursChange}
                            className="border rounded px-1 py-0.5 text-xs"
                          />
                          -
                          <input
                            type="time"
                            name="holidays.close"
                            value={futsal.operatingHours.holidays?.close || ""}
                            onChange={handleOperatingHoursChange}
                            className="border rounded px-1 py-0.5 text-xs"
                          />
                        </>
                      ) : (
                        <>
                          {futsal.operatingHours.holidays?.open} -{" "}
                          {futsal.operatingHours.holidays?.close}
                        </>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {futsal.pricing && (
                  <>
                    <div className="text-xs flex items-center gap-2">
                      Base Price:
                      {editMode ? (
                        <input
                          type="number"
                          name="basePrice"
                          value={futsal.pricing.basePrice || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              pricing: {
                                ...form.pricing,
                                basePrice: Number(e.target.value),
                              },
                            })
                          }
                          className="border rounded px-1 py-0.5 text-xs w-24"
                        />
                      ) : (
                        <>Rs. {futsal.pricing.basePrice}</>
                      )}
                    </div>
                    <div className="text-xs font-semibold mt-2">Modifiers:</div>
                    {/* Holiday Modifier */}
                    <div className="text-xs ml-2 flex items-center gap-2">
                      Holiday:
                      {editMode ? (
                        <>
                          <input
                            type="checkbox"
                            name="holiday.enabled"
                            checked={
                              !!futsal.pricing.modifiers?.holiday?.enabled
                            }
                            onChange={handlePricingModifierChange}
                          />
                          <input
                            type="number"
                            name="holiday.percentage"
                            value={
                              futsal.pricing.modifiers?.holiday?.percentage || 0
                            }
                            onChange={handlePricingModifierChange}
                            className="border rounded px-1 py-0.5 text-xs w-16"
                            min={0}
                            max={1}
                            step={0.01}
                          />
                          <span>%</span>
                        </>
                      ) : (
                        <>
                          {futsal.pricing.modifiers?.holiday?.enabled
                            ? `${futsal.pricing.modifiers.holiday.percentage * 100}%`
                            : "N/A"}
                        </>
                      )}
                    </div>
                    {/* Weekend Modifier */}
                    <div className="text-xs ml-2 flex items-center gap-2">
                      Weekend:
                      {editMode ? (
                        <>
                          <input
                            type="checkbox"
                            name="weekend.enabled"
                            checked={
                              !!futsal.pricing.modifiers?.weekend?.enabled
                            }
                            onChange={handlePricingModifierChange}
                          />
                          <input
                            type="number"
                            name="weekend.percentage"
                            value={
                              futsal.pricing.modifiers?.weekend?.percentage || 0
                            }
                            onChange={handlePricingModifierChange}
                            className="border rounded px-1 py-0.5 text-xs w-16"
                            min={0}
                            max={1}
                            step={0.01}
                          />
                          <span>%</span>
                        </>
                      ) : (
                        <>
                          {futsal.pricing.modifiers?.weekend?.enabled
                            ? `${futsal.pricing.modifiers.weekend.percentage * 100}%`
                            : "N/A"}
                        </>
                      )}
                    </div>
                    {/* Time of Day Modifier */}
                    <div className="text-xs ml-2 flex items-center gap-2">
                      Time of Day:
                      {editMode ? (
                        <input
                          type="checkbox"
                          name="timeOfDay.enabled"
                          checked={
                            !!futsal.pricing.modifiers?.timeOfDay?.enabled
                          }
                          onChange={handlePricingModifierChange}
                        />
                      ) : (
                        <>
                          {futsal.pricing.modifiers?.timeOfDay?.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </>
                      )}
                    </div>
                    {/* Time of Day Subfields */}
                    <div className="ml-6 space-y-1">
                      <div className="text-xs flex items-center gap-2">
                        Morning:
                        {editMode ? (
                          <input
                            type="number"
                            name="timeOfDay.morning"
                            value={
                              futsal.pricing.modifiers?.timeOfDay?.morning || 0
                            }
                            onChange={handlePricingModifierChange}
                            className="border rounded px-1 py-0.5 text-xs w-16"
                            min={0}
                            max={1}
                            step={0.01}
                          />
                        ) : (
                          <>{futsal.pricing.modifiers?.timeOfDay?.morning}</>
                        )}
                      </div>
                      <div className="text-xs flex items-center gap-2">
                        Midday:
                        {editMode ? (
                          <input
                            type="number"
                            name="timeOfDay.midday"
                            value={
                              futsal.pricing.modifiers?.timeOfDay?.midday || 0
                            }
                            onChange={handlePricingModifierChange}
                            className="border rounded px-1 py-0.5 text-xs w-16"
                            min={0}
                            max={1}
                            step={0.01}
                          />
                        ) : (
                          <>{futsal.pricing.modifiers?.timeOfDay?.midday}</>
                        )}
                      </div>
                      <div className="text-xs flex items-center gap-2">
                        Evening:
                        {editMode ? (
                          <input
                            type="number"
                            name="timeOfDay.evening"
                            value={
                              futsal.pricing.modifiers?.timeOfDay?.evening || 0
                            }
                            onChange={handlePricingModifierChange}
                            className="border rounded px-1 py-0.5 text-xs w-16"
                            min={0}
                            max={1}
                            step={0.01}
                          />
                        ) : (
                          <>{futsal.pricing.modifiers?.timeOfDay?.evening}</>
                        )}
                      </div>
                    </div>
                    {/* Location Modifier */}
                    <div className="text-xs ml-2 flex items-center gap-2">
                      Location:
                      {editMode ? (
                        <input
                          type="checkbox"
                          name="location.enabled"
                          checked={
                            !!futsal.pricing.modifiers?.location?.enabled
                          }
                          onChange={handlePricingModifierChange}
                        />
                      ) : (
                        <>
                          {futsal.pricing.modifiers?.location?.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </>
                      )}
                    </div>
                    <div className="ml-6 space-y-1">
                      <div className="text-xs flex items-center gap-2">
                        Near:
                        {editMode ? (
                          <input
                            type="number"
                            name="location.near"
                            value={
                              futsal.pricing.modifiers?.location?.near || 0
                            }
                            onChange={handlePricingModifierChange}
                            className="border rounded px-1 py-0.5 text-xs w-16"
                            min={-1}
                            max={1}
                            step={0.01}
                          />
                        ) : (
                          <>{futsal.pricing.modifiers?.location?.near}</>
                        )}
                      </div>
                      <div className="text-xs flex items-center gap-2">
                        Far:
                        {editMode ? (
                          <input
                            type="number"
                            name="location.far"
                            value={futsal.pricing.modifiers?.location?.far || 0}
                            onChange={handlePricingModifierChange}
                            className="border rounded px-1 py-0.5 text-xs w-16"
                            min={-1}
                            max={1}
                            step={0.01}
                          />
                        ) : (
                          <>{futsal.pricing.modifiers?.location?.far}</>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {editMode && (
              <Button
                className="w-full mt-4"
                type="submit"
                disabled={updateFutsal.status === "pending"}
              >
                <Settings className="h-4 w-4 mr-2" />
                {updateFutsal.status === "pending"
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
