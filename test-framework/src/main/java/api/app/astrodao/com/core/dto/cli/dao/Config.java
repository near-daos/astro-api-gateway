package api.app.astrodao.com.core.dto.cli.dao;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.core.utils.JsonUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor(staticName = "of")
public class Config {
    private String name;
    private String purpose;
    private String metadata;

    public static Config of(String name, String purpose, Metadata metadata) {
        String encodedMetadata = Base64Utils.encode(JsonUtils.writeValueAsString(metadata));
        return Config.of(name, purpose, encodedMetadata);
    }
}
