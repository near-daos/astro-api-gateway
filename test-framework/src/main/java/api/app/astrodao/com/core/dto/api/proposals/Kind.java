package api.app.astrodao.com.core.dto.api.proposals;

import api.app.astrodao.com.core.dto.cli.dao.Config;
import lombok.Data;

@Data
public class Kind {
    private String type;
    private Config config;
}
