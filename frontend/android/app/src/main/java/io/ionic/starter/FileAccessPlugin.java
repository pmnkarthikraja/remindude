package io.ionic.starter;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "FileAccess")
public class FileAccessPlugin extends Plugin {

    @PluginMethod
    public void openManageAllFilesSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            if (intent.resolveActivity(getContext().getPackageManager()) != null) {
                getActivity().startActivity(intent);
            } else {
                call.reject("No activity found to handle the intent.");
            }
        } else {
            call.reject("All Files Access is only available on Android 11 and above.");
        }
        call.resolve();
    }
}
