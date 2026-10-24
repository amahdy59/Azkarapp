package m.azkar.com;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.UUID;

@CapacitorPlugin(name = "AzkarFiles")
public class AzkarFilesPlugin extends Plugin {
    private final HashMap<String, OutputStream> streams = new HashMap<>();
    private final HashMap<String, Uri> documents = new HashMap<>();

    @PluginMethod
    public void create(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                .setType(call.getString("mimeType", "application/octet-stream"))
                .putExtra(Intent.EXTRA_TITLE, call.getString("name", "wa-zaker-audio"));
        startActivityForResult(call, intent, "documentCreated");
    }

    @ActivityCallback
    private void documentCreated(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("Save cancelled", "SAVE_CANCELLED");
            return;
        }
        Uri uri = result.getData().getData();
        try {
            OutputStream stream = getContext().getContentResolver().openOutputStream(uri, "w");
            if (stream == null) throw new java.io.IOException("Document unavailable");
            String token = UUID.randomUUID().toString();
            streams.put(token, stream);
            documents.put(token, uri);
            JSObject response = new JSObject();
            response.put("token", token);
            call.resolve(response);
        } catch (Exception error) { call.reject("Cannot open document", error); }
    }

    @PluginMethod
    public void append(PluginCall call) {
        OutputStream stream = streams.get(call.getString("token"));
        String data = call.getString("data", "");
        if (stream == null || data.length() > 65536) { call.reject("Invalid file transfer"); return; }
        try { stream.write(Base64.decode(data, Base64.DEFAULT)); call.resolve(); }
        catch (Exception error) { call.reject("Cannot write document", error); }
    }

    @PluginMethod
    public void finish(PluginCall call) {
        String token = call.getString("token");
        OutputStream stream = streams.remove(token);
        if (stream == null) { call.reject("Unknown file transfer"); return; }
        try { stream.close(); documents.remove(token); call.resolve(); }
        catch (Exception error) { call.reject("Cannot finish document", error); }
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        discard(call.getString("token"));
        call.resolve();
    }

    private void discard(String token) {
        OutputStream stream = streams.remove(token);
        try { if (stream != null) stream.close(); } catch (Exception ignored) {}
        Uri uri = documents.remove(token);
        try { if (uri != null) DocumentsContract.deleteDocument(getContext().getContentResolver(), uri); }
        catch (Exception ignored) { /* Some providers retain a partial user-created file. */ }
    }

    @Override
    protected void handleOnDestroy() {
        for (String token : new java.util.ArrayList<>(streams.keySet())) discard(token);
    }
}
