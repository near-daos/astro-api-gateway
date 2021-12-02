package api.app.astrodao.com.core.dto.cli.dao;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VotePolicy {
    public static VotePolicy of() {
        return new VotePolicy();
    }
}
