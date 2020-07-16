<script>
  import web3Modal from "./providers.js";
  import Box, * as rest from "3box";
  import { onMount } from "svelte";

  onMount(() => {
    const syncComplete = res => {
      console.log("Sync Complete");
      updateProfileData(window.box);
    };

    Box.create().then(box => {
      window.box = box;
      bauth.disabled = false;
      openThread.disabled = false;
    });

    bauth.addEventListener("click", event => {
      let ethProvider;
      web3Modal
        .connect()
        .then(provider => {
          ethProvider = provider;
          return provider.enable();
        })
        .then(addresses => {
          window.box
            .auth([], { address: addresses[0], provider: ethProvider })
            .then(() => {
              box.onSyncDone(syncComplete);
              console.log("authed");

              controlls.style.display = "block";
              updateProfileData(box);
              updateLinksData(box, addresses[0]);

              linkAddress.addEventListener("click", () => {
                box.linkAddress().then(() => {
                  updateLinksData(box, addresses[0]);
                });
              });

              setProfile.addEventListener("click", () => {
                box.public.set(prkey.value, prvalue.value).then(() => {
                  prkey.value = null;
                  prvalue.value = null;
                  updateProfileData(box);
                });
              });
              verifyGithub.addEventListener("click", () => {
                box.verified
                  .addGithub(gisturl.value)
                  .then(() => {
                    updateProfileData(box);
                  })
                  .catch(error => {
                    githubUser.innerHTML = error;
                  });
              });

              setPrivateStore.addEventListener("click", () => {
                box.private.set(pskey.value, psvalue.value).then(() => {
                  pskey.value = null;
                  psvalue.value = null;
                });
              });

              getPrivateStore.addEventListener("click", () => {
                const key = getpskey.value;
                box.private.get(key).then(val => {
                  getpskey.value = null;
                  updatePrivateData(key, val);
                });
              });

              openSpace.addEventListener("click", () => {
                const name = spaceName.value;
                window.currentSpace = name;
                const opts = {
                  onSyncDone: () => {
                    console.log("sync done in space", name);
                    updateSpaceData();
                  }
                };
                box.openSpace(name, opts).then(() => {
                  spacePub.innerHTML = `Public data in ${name}:`;
                  spacePriv.innerHTML = `Private data in ${name}:`;
                  spaceCtrl.style.display = "block";
                  confidentialThreads.style.display = "block";
                  updateSpaceData();
                });
              });

              setSpacePub.addEventListener("click", () => {
                console.log(spkey.value, spvalue.value);
                box.spaces[window.currentSpace].public
                  .set(spkey.value, spvalue.value)
                  .then(() => {
                    spkey.value = null;
                    spvalue.value = null;
                    updateSpaceData();
                  });
              });
              setSpacePriv.addEventListener("click", () => {
                console.log(sskey.value, ssvalue.value);
                box.spaces[window.currentSpace].private
                  .set(sskey.value, ssvalue.value)
                  .then(() => {
                    sskey.value = null;
                    ssvalue.value = null;
                    updateSpaceData();
                  });
              });
              const updateSpaceData = () => {
                console.log(box.spaces[window.currentSpace]);
                box.spaces[window.currentSpace].public.all().then(entries => {
                  spaceDataPub.innerHTML = "";
                  Object.keys(entries).map(k => {
                    spaceDataPub.innerHTML += k + ": " + entries[k] + "<br />";
                  });
                });
                box.spaces[window.currentSpace].private.all().then(entries => {
                  spaceDataPriv.innerHTML = "";
                  Object.keys(entries).map(k => {
                    spaceDataPriv.innerHTML += k + ": " + entries[k] + "<br />";
                  });
                });
              };
            });

          bclose.addEventListener("click", () => {
            logout(box);
          });
        });
    });

    openThread.addEventListener("click", () => {
      const name = threadName.value;
      const space = threadSpaceName.value;
      const firstModerator = threadfirstModerator.value;
      const membersBool = members.checked;
      const ghostBool = ghostCheck.checked;
      console.log("ghost?", ghostBool);
      displayThread(false);
      if (ghostCheck.checked) {
        addThreadMod.disabled = true;
      }
      box
        .openThread(space, name, {
          firstModerator,
          members: membersBool,
          ghost: ghostBool
        })
        .then(registerThreadEvents)
        .catch(updateThreadError);
    });

    joinConfThread.addEventListener("click", () => {
      const address = confThreadAddress.value;
      displayThread(true);
      box.spaces[window.currentSpace]
        .joinThreadByAddress(address)
        .then(registerThreadEvents)
        .catch(updateThreadError);
    });

    createConfThread.addEventListener("click", () => {
      const name = confThreadName.value;
      displayThread(true);
      box.spaces[window.currentSpace]
        .createConfidentialThread(name)
        .then(registerThreadEvents)
        .catch(updateThreadError);
    });

    addThreadMod.addEventListener("click", () => {
      const id = threadMod.value;
      window.currentThread
        .addModerator(id)
        .then(res => {
          updateThreadCapabilities();
        })
        .catch(updateThreadError);
    });

    addThreadMember.addEventListener("click", () => {
      const id = threadMember.value;
      window.currentThread
        .addMember(id)
        .then(res => {
          updateThreadCapabilities();
        })
        .catch(updateThreadError);
    });

    window.deletePost = el => {
      window.currentThread
        .deletePost(el.id)
        .then(res => {
          updateThreadData();
        })
        .catch(updateThreadError);
    };

    const registerThreadEvents = thread => {
      window.currentThread = thread;
      thread.onUpdate(() => {
        updateThreadData();
      });
      thread.onNewCapabilities(() => {
        updateThreadCapabilities();
      });
      if (window.currentThread._room == undefined) {
        updateThreadData();
        updateThreadCapabilities();
      }
    };

    const displayThread = members => {
      posts.style.display = "block";
      threadModeration.style.display = "block";
      if (members) threadMembers.style.display = "block";
    };

    const updateThreadError = (e = "") => {
      threadACError.innerHTML = e;
    };

    const updateThreadData = () => {
      threadData.innerHTML = "";
      threadAddress.innerHTML = window.currentThread.address;
      updateThreadError();
      window.currentThread.getPosts().then(posts => {
        console.log(posts);
        posts.map(post => {
          threadData.innerHTML +=
            post.author + ": <br />" + post.message + "<br /><br />";
          threadData.innerHTML +=
            `<button id="` +
            post.postId +
            `"onClick="window.deletePost(` +
            post.postId +
            `)" type="button" class="btn btn btn-primary" >Delete</button>` +
            "<br /><br />";
        });
      });
    };

    const updateThreadCapabilities = () => {
      threadMemberList.innerHTML = "";
      // if else statement cause ghost thread can't list moderators
      if (window.currentThread._peerId) {
        window.currentThread.listMembers().then(members => {
          members.map(member => {
            threadMemberList.innerHTML += member + "<br />";
          });
        });
      } else {
        if (window.currentThread._members) {
          window.currentThread.listMembers().then(members => {
            members.map(member => {
              threadMemberList.innerHTML += member + "<br />";
            });
          });
        }
        threadModeratorList.innerHTML = "";
        window.currentThread.listModerators().then(moderators => {
          moderators.map(moderator => {
            threadModeratorList.innerHTML += moderator + "<br />";
          });
        });
      }
    };

    postThread.addEventListener("click", () => {
      window.currentThread.post(postMsg.value).catch(updateThreadError);
    });

    getProfile.addEventListener("click", () => {
      console.log(ethAddr.value);
      Box.getProfile(ethAddr.value, {}).then(profile => {
        console.log(profile);
        Object.entries(profile).map(kv => {
          getProfileData.innerHTML += kv[0] + ": " + kv[1] + "<br />";
        });
      });
    });

    profileGraphQL.addEventListener("click", () => {
      const query = profileGraphQLQuery.value;
      console.log(query);
      Box.profileGraphQL(query).then(res => {
        console.log(res);
        profileGraphQLData.innerHTML = "";
        if (res.profile) {
          Object.entries(res.profile).map(kv => {
            profileGraphQLData.innerHTML += kv[0] + ": " + kv[1] + "<br />";
          });
        } else if (res.profiles) {
          res.profiles.map(profile => {
            Object.entries(profile).map(kv => {
              profileGraphQLData.innerHTML += kv[0] + ": " + kv[1] + "<br />";
            });
            profileGraphQLData.innerHTML += "<hr />";
          });
        }
      });
    });

    function updateProfileData(box) {
      box.public.all().then(profile => {
        console.log(profile);
        let tmpData = "";
        Object.entries(profile).map(kv => {
          tmpData += kv[0] + ": " + kv[1] + "<br />";
        });
        profileData.innerHTML = tmpData;
      });
      updateGithubUser(box);
    }

    function updatePrivateData(key, value) {
      privateStoreData.innerHTML = "";
      privateStoreData.innerHTML = key + ": " + value;
    }

    function logout(box) {
      box.logout().then(() => {
        privateStoreData.innerHTML = "";
        profileData.innerHTML = "";
        controlls.style.display = "none";
      });
    }

    function updateGithubUser(box) {
      githubUser.innerHTML = "";
      box.verified
        .github()
        .then(res => {
          console.log(res.username);
          githubUser.innerHTML = res.username;
        })
        .catch(error => {
          githubUser.innerHTML = error;
        });
    }

    function updateLinksData(box, address) {
      didInfo.innerHTML = box.DID;

      addressLinks.innerHTML = "";
      box.listAddressLinks().then(links => {
        links.forEach((link, index) => {
          addressLinks.innerHTML += `<b>${index + 1})</b> ${new Date(
            link.timestamp * 1000
          ).toLocaleString()}
      <br><b>LinkID: </b>${link.linkId}
      <br><b>Address: </b>${link.address}
      <br><b>Type: </b>${link.type}
      <br><br>`;
        });
      });

      box.isAddressLinked({ address }).then(result => {
        addressLinked.innerHTML = result ? "Yes" : "No";
        linkAddress.style.display = "block";
      });
    }
  });
</script>

<button
  id="bauth"
  type="button"
  class="btn btn-primary"
  style="margin: 50px 100px;"
  disabled="true">
  Auth 3box
</button>

<div id="controlls" style="display: none; padding: 5px 100px;">

  <div style="padding: 0px 0px 25px 0px;">
    <h2>Identity</h2>
    <h5 style="padding: 20px 0px 10px 0px">DID:</h5>
    <p>
      <span id="didInfo" />
    </p>

    <h3>Address Links</h3>
    <p>
      <span id="addressLinks" />
    </p>

    <h5>Current address linked?</h5>
    <p>
      <span id="addressLinked" />
    </p>
    <button id="linkAddress" type="button" class="btn btn-primary">
      Link address
    </button>
  </div>

  <!-- Public Store Div -->
  <div style="padding: 0px 0px 25px 0px;">
    <h2>Public Store</h2>

    <input type="text" id="prkey" placeholder="Profile Key" />
    <input type="text" id="prvalue" placeholder="Profile Value" />
    <button id="setProfile" type="button" class="btn btn-primary">
      Set Profile Data
    </button>

    <h3>Verified Accounts</h3>
    <p>
      <span id="verifiedAccounts" />
    </p>
    <input type="text" id="gisturl" placeholder="Gist URL" />
    <button id="verifyGithub" type="button" class="btn btn-primary">
      Verify Github
    </button>

    <p>
      <b>Verified Github:</b>
      <span id="githubUser" />
    </p>

    <h5 style="padding: 20px 0px 10px 0px">Profile:</h5>
    <p>
      <span id="profileData" />
    </p>
  </div>

  <!-- Private Store Div -->
  <div>
    <h2>Private Store</h2>
    <input type="text" id="pskey" placeholder="Private Store Key" />
    <input type="text" id="psvalue" placeholder="Private Store Value" />
    <button id="setPrivateStore" type="button" class="btn btn btn-primary">
      Set Private Store Data
    </button>

    <h5 style="padding: 20px 0px 10px 0px">
      Private Store Data : (Key must be known to get value)
    </h5>
    <input type="text" id="getpskey" placeholder="Private Store Key" />
    <button id="getPrivateStore" type="button" class="btn btn btn-primary">
      Get Private Store Value
    </button>

    <p style="padding: 20px 0px 10px 0px">
      <span id="privateStoreData" />
    </p>
  </div>

  <div>
    <h2>Spaces</h2>

    <input type="text" id="spaceName" placeholder="Open space by name" />
    <button id="openSpace" type="button" class="btn btn btn-primary">
      Open space
    </button>

    <div id="spaceCtrl" style="display: none;">
      <h3>Public data:</h3>
      <input type="text" id="spkey" placeholder="Key" />
      <input type="text" id="spvalue" placeholder="Value" />
      <button id="setSpacePub" type="button" class="btn btn-primary">
        Set Space Data
      </button>
      <h5 style="padding: 20px 0px 10px 0px" id="spacePub" />
      <p>
        <span id="spaceDataPub" />
      </p>
      <h3>Private data:</h3>
      <input type="text" id="sskey" placeholder="Key" />
      <input type="text" id="ssvalue" placeholder="Value" />
      <button id="setSpacePriv" type="button" class="btn btn-primary">
        Set Space Data
      </button>
      <h5 style="padding: 20px 0px 10px 0px" id="spacePriv" />
      <p>
        <span id="spaceDataPriv" />
      </p>

    </div>
  </div>

  <!-- Logout -->
  <div style="padding: 25px 0px;">
    <button id="bclose" type="button" class="btn btn-primary">
      Logout from 3box
    </button>
  </div>
</div>

<div style="padding: 0px 0px 25px 100px;">
  <h3>Threads:</h3>
  <input type="text" id="threadName" placeholder="Name of thread" />
  <br />
  <input type="text" id="threadSpaceName" placeholder="Space name" />
  <br />
  <input
    type="text"
    id="threadfirstModerator"
    placeholder="Thread Root Moderator" />
  <br />
  <span>Members Only Thread</span>
  <input type="radio" name="members" id="members" value="true" />
  <br />
  <span>Ghost ?</span>
  <input type="radio" name="ghostCheck" id="ghostCheck" value="true" />
  <br />
  <button
    id="openThread"
    type="button"
    class="btn btn btn-primary"
    disabled="true">
    Open thread
  </button>
  <br />
  <br />

  <div id="confidentialThreads" style="display: none;">
    <h3>Confidential Threads:</h3>
    <h6>Create:</h6>
    <input type="text" id="confThreadName" placeholder="Name of thread" />
    <br />
    <button id="createConfThread" type="button" class="btn btn btn-primary">
      Create thread
    </button>
    <br />
    <br />
    <h6>Join By Address:</h6>
    <input type="text" id="confThreadAddress" placeholder="Address of thread" />
    <br />
    <button id="joinConfThread" type="button" class="btn btn btn-primary">
      Join thread
    </button>
    <br />
    <br />
  </div>

  <div id="threadModeration" style="display: none;">
    <input type="text" id="threadMod" placeholder="Thread Moderator" />
    <button id="addThreadMod" type="button" class="btn btn btn-primary">
      Add Thread Moderator
    </button>
    <br />
    <h5>Moderators:</h5>
    <p>
      <span id="threadModeratorList" />
    </p>
  </div>
  <div id="threadMembers" style="display: none;">
    <input type="text" id="threadMember" placeholder="Thread Member" />
    <button id="addThreadMember" type="button" class="btn btn btn-primary">
      Add Thread Member
    </button>
    <br />
    <h5>Members:</h5>
    <p>
      <span id="threadMemberList" />
    </p>
  </div>
  <br />

  <p>
    <span id="threadACError" />
  </p>
  <h6>Thread Address:</h6>
  <p>
    <span id="threadAddress" />
  </p>

  <div id="posts" style="display: none;">
    <h4>Posts:</h4>
    <p>
      <span id="threadData" />
    </p>
    <input type="text" id="postMsg" placeholder="Type your message" />
    <button id="postThread" type="button" class="btn btn btn-primary">
      Post
    </button>
  </div>
</div>

<hr />
<div style="padding: 5px 100px;">
  <!-- Get Profile Div -->
  <div style="padding: 0px 0px 25px 0px;">
    <h2>Get Profile</h2>

    <input type="text" id="ethAddr" placeholder="Ethereum Address" />
    <button id="getProfile" type="button" class="btn btn-primary">
      Get Profile Data
    </button>

    <h5 style="padding: 20px 0px 10px 0px">Profile:</h5>
    <p>
      <span id="getProfileData" />
    </p>
  </div>
</div>

<div style="padding: 5px 100px; width: 100%;">
  <!-- Get Profile GraphQL Div -->
  <div style="padding: 0px 0px 25px 0px;">
    <h2>Get Profile GraphQL</h2>
    <div style="width: 100%;">
      <textarea id="profileGraphQLQuery" rows="9" cols="70">
        {`{profile(id: "PUT_AN_ADDRESS_HERE") {
                name
                image
                emoji
                proof_did
              }}`}
      </textarea>
    </div>

    <button id="profileGraphQL" type="button" class="btn btn-primary">
      Query Profiles
    </button>

    <h5 style="padding: 20px 0px 10px 0px">Profile:</h5>
    <p>
      <span id="profileGraphQLData" />
    </p>
  </div>
</div>
