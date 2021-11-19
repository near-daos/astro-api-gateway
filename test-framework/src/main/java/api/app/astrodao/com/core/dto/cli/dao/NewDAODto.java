package api.app.astrodao.com.core.dto.cli.dao;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.core.utils.JsonUtils;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class NewDAODto {
    private String name;
    private String args;

    public static NewDAODto of(String name, DAOArgs daoArgs) {
        String encodedDAOArgs = Base64Utils.encode(JsonUtils.writeValueAsString(daoArgs));
        return NewDAODto.of(name, encodedDAOArgs);
    }
}
