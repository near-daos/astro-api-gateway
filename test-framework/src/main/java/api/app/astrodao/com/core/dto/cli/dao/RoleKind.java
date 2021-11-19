package api.app.astrodao.com.core.dto.cli.dao;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor(staticName = "of")
public class RoleKind {
    @JsonProperty("Group")
    public List<String> group;
}
