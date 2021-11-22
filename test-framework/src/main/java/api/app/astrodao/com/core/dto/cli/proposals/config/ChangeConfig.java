package api.app.astrodao.com.core.dto.cli.proposals.config;

import api.app.astrodao.com.core.dto.cli.dao.Config;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class ChangeConfig {
    private Config config;
}
