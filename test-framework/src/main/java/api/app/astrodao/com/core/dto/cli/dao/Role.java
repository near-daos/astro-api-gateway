package api.app.astrodao.com.core.dto.cli.dao;

import api.app.astrodao.com.core.utils.JsonUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.List;

@JsonPropertyOrder({
        "name",
        "kind",
        "permissions",
        "vote_policy"
})
@Data
@Accessors(chain = true)
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Role<T> {
    @JsonProperty("name")
    public String name;
    @JsonProperty("kind")
    public T kind;
    @JsonProperty("permissions")
    public List<String> permissions;
    @JsonProperty("vote_policy")
    public VotePolicy votePolicy;

    public static <T> Role<T> of() {
        return new Role<>();
    }

    @JsonIgnore
    public KindWithGroup getKindWithGroup() {
        if (kind instanceof KindWithGroup) {
            return JsonUtils.valueToObject(kind, KindWithGroup.class);
        }
        throw new UnsupportedOperationException("Kind without group");
    }
}
