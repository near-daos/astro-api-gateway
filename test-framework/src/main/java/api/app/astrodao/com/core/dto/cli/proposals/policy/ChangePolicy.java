package api.app.astrodao.com.core.dto.cli.proposals.policy;

import api.app.astrodao.com.core.dto.cli.dao.Policy;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class ChangePolicy {
    public Policy policy;
}
