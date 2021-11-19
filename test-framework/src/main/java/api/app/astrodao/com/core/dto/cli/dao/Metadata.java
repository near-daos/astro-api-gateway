package api.app.astrodao.com.core.dto.cli.dao;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.core.utils.JsonUtils;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Accessors(chain = true)
@Data(staticConstructor = "of")
public class Metadata {
    private String flag;
    private String displayName;
    private List<String> links;

    public static Metadata decodeMetadata(String metadataBase64) {
        String decodeString = Base64Utils.decode(metadataBase64);
        return JsonUtils.readValue(decodeString, Metadata.class);
    }
}
