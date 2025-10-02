// screens/Admin/CreatePostScreen.js
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

const { width, height } = Dimensions.get("window");

export default function CreatePostScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);

  const isEdit = route?.params?.mode === "edit";
  const editPost = route?.params?.post || null;

  const [title, setTitle] = useState(editPost?.title || "");
  const [className, setClassName] = useState(editPost?.class || "");
  const [subject, setSubject] = useState(editPost?.subject || "");
  const [board, setBoard] = useState(editPost?.board || "");
  const [salary, setSalary] = useState(
    editPost?.salary ? String(editPost.salary) : ""
  );
  const [time, setTime] = useState(editPost?.time || "");
  const [address, setAddress] = useState(editPost?.address || "");
  const [genderPreference, setGenderPreference] = useState(
    editPost?.genderPreference || "any"
  );
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      Alert.alert("Forbidden", "Please login to create or edit posts");
      navigation.getParent()?.navigate("MainTabs", { screen: "Home" });
    }
  }, [user]);

  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: "OK", style: "default" }]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to photos");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow camera access");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const createOrUpdatePost = async () => {
    if (
      !title ||
      !className ||
      !subject ||
      !board ||
      salary === "" ||
      !time ||
      !address
    ) {
      return Alert.alert("Error", "Please fill all required fields");
    }

    const salaryNum = Number(salary);
    if (!Number.isFinite(salaryNum)) {
      showAlert("Validation Error", "Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      if (isEdit && editPost) {
        const { data } = await API.put(`/posts/${editPost._id}`, {
          title,
          class: className,
          subject,
          board,
          salary: salaryNum,
          time,
          address,
          genderPreference,
        });
        if (data.success) {
          showAlert("Success", "Post updated successfully!");
          navigation.goBack();
        } else {
          showAlert("Update Failed", data.message);
        }
      } else {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("class", className);
        formData.append("subject", subject);
        formData.append("board", board);
        formData.append("salary", String(salary));
        formData.append("time", time);
        formData.append("address", address);
        formData.append("genderPreference", genderPreference);

        if (imageUri) {
          const uriParts = imageUri.split(".");
          const fileExt = uriParts[uriParts.length - 1];
          formData.append("image", {
            uri:
              Platform.OS === "android"
                ? imageUri
                : imageUri.replace("file://", ""),
            name: `post.${fileExt}`,
            type: `image/${fileExt === "heic" ? "jpeg" : fileExt}`,
          });
        }

        const { data } = await API.post("/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (data.success) {
          showAlert("Success", "Post created successfully!");
          navigation.goBack();
        } else {
          showAlert("Creation Failed", data.message);
        }
      }
    } catch (err) {
      console.error(
        "Create/Update post error:",
        err.response || err.message || err
      );
     showAlert('Error', err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Post" : "Create Post"}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Card */}
          <View style={styles.card}>
            {/* Image Upload Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Post Image</Text>
              <View style={styles.imageSection}>
                {imageUri ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={removeImage}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imageUploadPlaceholder}>
                    <MaterialIcons
                      name="add-photo-alternate"
                      size={48}
                      color="#CBD5E1"
                    />
                    <Text style={styles.imageUploadText}>Add a photo</Text>
                    <Text style={styles.imageUploadSubtext}>Optional</Text>
                  </View>
                )}

                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={pickImage}
                  >
                    <Feather name="image" size={20} color="#667eea" />
                    <Text style={styles.imageButtonText}>Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={takePhoto}
                  >
                    <Feather name="camera" size={20} color="#667eea" />
                    <Text style={styles.imageButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Post Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Post Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <Input
                  placeholder="Enter post title"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Class *</Text>
                  <Input
                    placeholder="e.g. 10th"
                    value={className}
                    onChangeText={setClassName}
                    style={styles.input}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Subject *</Text>
                  <Input
                    placeholder="e.g. Mathematics"
                    value={subject}
                    onChangeText={setSubject}
                    style={styles.input}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Educational Board *</Text>
                <Input
                  placeholder="e.g. CBSE, State Board"
                  value={board}
                  onChangeText={setBoard}
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Salary (₹) *</Text>
                <Input
                  placeholder="Enter expected salary"
                  value={String(salary)}
                  onChangeText={setSalary}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Timing *</Text>
                <Input
                  placeholder="e.g. 6pm - 8pm, Weekends"
                  value={time}
                  onChangeText={setTime}
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address *</Text>
                <Input
                  placeholder="Enter full address"
                  value={address}
                  onChangeText={setAddress}
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender Preference</Text>
                <View style={styles.genderOptions}>
                  {["any", "male", "female"].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderOption,
                        genderPreference === gender &&
                          styles.genderOptionActive,
                      ]}
                      onPress={() => setGenderPreference(gender)}
                    >
                      <Text
                        style={[
                          styles.genderOptionText,
                          genderPreference === gender &&
                            styles.genderOptionTextActive,
                        ]}
                      >
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionSection}>
            <Button
              title={isEdit ? "Update Post" : "Create Post"}
              onPress={createOrUpdatePost}
              style={styles.submitButton}
              textStyle={styles.submitButtonText}
              loading={loading}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#667eea",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  imageSection: {
    alignItems: "center",
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageUploadPlaceholder: {
    width: "100%",
    height: 150,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  imageUploadText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 8,
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
  },
  imageButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    minWidth: 120,
    justifyContent: "center",
  },
  imageButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
  },
  genderOptions: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  genderOptionActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  genderOptionTextActive: {
    color: "#667eea",
  },
  actionSection: {
    paddingHorizontal: 4,
  },
  submitButton: {
    backgroundColor: "#667eea",
    borderRadius: 18,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: "#5a6fd8",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
  },
});
