package m.azkar.com;

import android.app.Activity;
import android.content.ClipData;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "NativeSharing")
public class NativeSharingPlugin extends Plugin {
    @PluginMethod
    public void share(PluginCall call) {
        try {
            String title = call.getString("title", "AzkarApp");
            String text = call.getString("text");
            String url = call.getString("url");
            JSONArray files = call.getData().optJSONArray("files");
            List<Uri> uris = new ArrayList<>();
            List<String> mimeTypes = new ArrayList<>();
            File shareDirectory = new File(getContext().getCacheDir(), "shared-exports");
            if (!shareDirectory.exists() && !shareDirectory.mkdirs()) {
                call.reject("Could not prepare the shared file.");
                return;
            }
            for (int i = 0; files != null && i < files.length(); i++) {
                JSONObject item = files.getJSONObject(i);
                String name = safeFileName(item.optString("name", "azkar-share"));
                String mimeType = item.optString("mimeType", "application/octet-stream");
                byte[] contents = decode(item.optString("data", ""));
                File output = new File(shareDirectory, name);
                try (FileOutputStream stream = new FileOutputStream(output)) {
                    stream.write(contents);
                }
                uris.add(FileProvider.getUriForFile(
                    getContext(), getContext().getPackageName() + ".fileprovider", output
                ));
                mimeTypes.add(mimeType);
            }

            Intent send;
            if (uris.size() > 1) {
                send = new Intent(Intent.ACTION_SEND_MULTIPLE);
                send.putParcelableArrayListExtra(Intent.EXTRA_STREAM, new ArrayList<>(uris));
                send.setType(commonMimeType(mimeTypes));
            } else if (!uris.isEmpty()) {
                send = new Intent(Intent.ACTION_SEND);
                send.putExtra(Intent.EXTRA_STREAM, uris.get(0));
                send.setType(mimeTypes.get(0));
            } else {
                send = new Intent(Intent.ACTION_SEND);
                send.setType("text/plain");
            }
            if (text != null && !text.isEmpty()) send.putExtra(Intent.EXTRA_TEXT, text);
            if (url != null && !url.isEmpty()) send.putExtra(Intent.EXTRA_TEXT, url);
            send.putExtra(Intent.EXTRA_SUBJECT, title);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            if (!uris.isEmpty()) {
                ClipData clip = ClipData.newUri(getContext().getContentResolver(), title, uris.get(0));
                for (int i = 1; i < uris.size(); i++) {
                    clip.addItem(new ClipData.Item(uris.get(i)));
                }
                send.setClipData(clip);
            }
            getActivity().startActivity(Intent.createChooser(send, title));
            call.resolve();
        } catch (Exception error) {
            call.reject("Could not share this export.", error);
        }
    }

    @PluginMethod
    public void saveFile(PluginCall call) {
        try {
            JSObject file = call.getData().getJSObject("file");
            if (file == null) {
                call.reject("No file was provided.");
                return;
            }
            String name = safeFileName(file.optString("name", "azkar-export"));
            String mimeType = file.optString("mimeType", "application/octet-stream");
            byte[] contents = decode(file.optString("data", ""));
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                saveToDownloads(call, name, mimeType, contents);
                return;
            }

            Intent create = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            create.addCategory(Intent.CATEGORY_OPENABLE);
            create.setType(mimeType);
            create.putExtra(Intent.EXTRA_TITLE, name);
            call.getData().put("pendingBytes", Base64.encodeToString(contents, Base64.NO_WRAP));
            startActivityForResult(call, create, "saveDocumentResult");
        } catch (Exception error) {
            call.reject("Could not save this export.", error);
        }
    }

    @ActivityCallback
    private void saveDocumentResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            call.reject("Saving was cancelled.");
            return;
        }
        Uri destination = result.getData().getData();
        if (destination == null) {
            call.reject("No save location was selected.");
            return;
        }
        try (OutputStream stream = getContext().getContentResolver().openOutputStream(destination)) {
            String encoded = call.getString("pendingBytes");
            stream.write(Base64.decode(encoded, Base64.NO_WRAP));
            call.resolve();
        } catch (Exception error) {
            call.reject("Could not write the selected file.", error);
        }
    }

    private void saveToDownloads(PluginCall call, String name, String mimeType, byte[] contents) throws Exception {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            call.reject("Direct Downloads export requires Android 10 or later.");
            return;
        }
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, name);
        values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/AzkarApp");
        values.put(MediaStore.Downloads.IS_PENDING, 1);
        Uri destination = getContext().getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (destination == null) throw new IllegalStateException("Downloads could not create a file.");
        try (OutputStream stream = getContext().getContentResolver().openOutputStream(destination)) {
            if (stream == null) throw new IllegalStateException("Downloads could not open the new file.");
            stream.write(contents);
        } catch (Exception error) {
            getContext().getContentResolver().delete(destination, null, null);
            throw error;
        }
        ContentValues ready = new ContentValues();
        ready.put(MediaStore.Downloads.IS_PENDING, 0);
        getContext().getContentResolver().update(destination, ready, null, null);
        call.resolve();
    }

    private byte[] decode(String encoded) {
        return Base64.decode(encoded, Base64.DEFAULT);
    }

    private String safeFileName(String name) {
        String safe = new File(name).getName().replaceAll("[^A-Za-z0-9._-]", "_");
        return safe.isEmpty() ? "azkar-export" : safe;
    }

    private String commonMimeType(List<String> mimeTypes) {
        if (mimeTypes.isEmpty()) return "application/octet-stream";
        String first = mimeTypes.get(0);
        for (String mimeType : mimeTypes) {
            if (!first.equals(mimeType)) return "*/*";
        }
        return first.toLowerCase(Locale.ROOT);
    }
}
